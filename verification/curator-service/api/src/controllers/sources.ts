import { Request, Response } from 'express';
import { Source, SourceDocument } from '../model/source';

import AwsEventsClient from '../clients/aws-events-client';
import AwsLambdaClient from '../clients/aws-lambda-client';

export default class SourcesController {
    constructor(
        private readonly lambdaClient: AwsLambdaClient,
        private readonly awsEventsClient: AwsEventsClient,
        private readonly retrievalFunctionArn: string,
    ) {}

    /**
     * List the sources.
     * Response will contain {sources: [list of sources]}
     * and potentially another nextPage: <num> if more results are available.
     * Default values of 10 for limit and 1 for page is used.
     */
    list = async (req: Request, res: Response): Promise<void> => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        if (page < 1) {
            res.status(422).json('page must be > 0');
            return;
        }
        if (limit < 1) {
            res.status(422).json('limit must be > 0');
            return;
        }
        const filter = req.query.url
            ? {
                  'origin.url': new RegExp(req.query.url as string, 'i'),
              }
            : {};
        try {
            const [docs, total] = await Promise.all([
                Source.find(filter)
                    .skip(limit * (page - 1))
                    .limit(limit + 1),
                Source.countDocuments({}),
            ]);
            // If we have more items than limit, add a response param
            // indicating that there is more to fetch on the next page.
            if (docs.length == limit + 1) {
                docs.splice(limit);
                res.json({
                    sources: docs,
                    nextPage: page + 1,
                    total: total,
                });
                return;
            }
            // If we fetched all available data, just return it.
            res.json({ sources: docs, total: total });
        } catch (e) {
            res.status(422).json(e.message);
            return;
        }
    };

    /**
     * Get a single source.
     */
    get = async (req: Request, res: Response): Promise<void> => {
        const doc = await Source.findById(req.params.id);
        if (!doc) {
            res.status(404).json(
                `source with id ${req.params.id} could not be found`,
            );
            return;
        }
        res.json(doc);
    };

    /**
     * Update a single source.
     */
    update = async (req: Request, res: Response): Promise<void> => {
        try {
            const source = await Source.findById(req.params.id);
            if (!source) {
                res.status(404).json(
                    `source with id ${req.params.id} could not be found`,
                );
                return;
            }
            await source.set(req.body).validate();
            await this.updateAutomationScheduleAwsResources(source);
            const result = await source.save();
            res.json(result);
        } catch (err) {
            if (err.name === 'ValidationError') {
                res.status(422).json(err.message);
                return;
            }
            res.status(500).json(err.message);
            return;
        }
    };

    /**
     * Performs updates on AWS assets corresponding to the provided source,
     * based on the content of the update operation.
     *
     * Note that, because Mongoose document validation is currently used for all
     * of our APIs, and we're performing partial updates (as opposed to
     * overwrites) by default, the condition in which a validated field is
     * updated to be empty is unreachable.
     *
     * TODO: Allow deleting schema-validated fields in update operations.
     */
    private async updateAutomationScheduleAwsResources(
        source: SourceDocument,
    ): Promise<void> {
        // Careful here, source.isModified('automation.schedule.awsScheduleExpression')
        // will return true even when just the parser is updated which is
        // error prone, prefer isModified() without dotted.paths if possible.
        if (source.automation?.schedule?.isModified('awsScheduleExpression')) {
            if (source.automation?.schedule?.awsScheduleExpression) {
                const awsRuleArn = await this.awsEventsClient.putRule(
                    source.toAwsRuleName(),
                    source.toAwsRuleDescription(),
                    source.automation.schedule.awsScheduleExpression,
                    this.retrievalFunctionArn,
                    source.toAwsRuleTargetId(),
                    source._id.toString(),
                    source.toAwsStatementId(),
                );
                source.set('automation.schedule.awsRuleArn', awsRuleArn);
            } else {
                await this.awsEventsClient.deleteRule(
                    source.toAwsRuleName(),
                    source.toAwsRuleTargetId(),
                    this.retrievalFunctionArn,
                    source.toAwsStatementId(),
                );
                source.set('automation.schedule', undefined);
            }
        } else if (
            source.isModified('name') &&
            source.automation?.schedule?.awsRuleArn
        ) {
            await this.awsEventsClient.putRule(
                source.toAwsRuleName(),
                source.toAwsRuleDescription(),
            );
        }
    }

    /**
     * Create a single source.
     */
    create = async (req: Request, res: Response): Promise<void> => {
        try {
            const source = new Source(req.body);
            await source.validate();
            await this.createAutomationScheduleAwsResources(source);
            const result = await source.save();
            res.status(201).json(result);
        } catch (err) {
            if (err.name === 'ValidationError') {
                res.status(422).json(err.message);
                return;
            }
            res.status(500).json(err.message);
        }
    };

    /**
     * Performs creation of AWS assets corresponding to the provided source,
     * based on the content of the create operation.
     *
     * If an automation schedule is present, a CloudWatch scheduled rule will
     * be created with a target of the global retrieval function. A resource-
     * based permission will be added to the global retrieval function such
     * that it can be invoked by the rule.
     */
    private async createAutomationScheduleAwsResources(
        source: SourceDocument,
    ): Promise<void> {
        if (source.automation?.schedule) {
            const createdRuleArn = await this.awsEventsClient.putRule(
                source.toAwsRuleName(),
                source.toAwsRuleDescription(),
                source.automation.schedule.awsScheduleExpression,
                this.retrievalFunctionArn,
                source.toAwsRuleTargetId(),
                source._id.toString(),
                source.toAwsStatementId(),
            );
            source.set('automation.schedule.awsRuleArn', createdRuleArn);
        }
    }

    /**
     * Delete a single source.
     */
    del = async (req: Request, res: Response): Promise<void> => {
        const source = await Source.findById(req.params.id);
        if (!source) {
            res.sendStatus(404);
            return;
        }
        if (source.automation?.schedule?.awsRuleArn) {
            await this.awsEventsClient.deleteRule(
                source.toAwsRuleName(),
                source.toAwsRuleTargetId(),
                this.retrievalFunctionArn,
                source.toAwsStatementId(),
            );
        }
        source.remove();
        res.status(204).end();
        return;
    };

    /** Trigger retrieval of the source's content in S3. */
    retrieve = async (req: Request, res: Response): Promise<void> => {
        try {
            const output = await this.lambdaClient.invokeRetrieval(
                req.params.id,
            );
            res.json(output);
        } catch (err) {
            res.status(500).json(err.message);
        }
        return;
    };
}
