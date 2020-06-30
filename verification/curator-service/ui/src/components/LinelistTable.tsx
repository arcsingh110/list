import { Case, Pathogen, Travel, TravelHistory } from './Case';
import MaterialTable, { QueryResult } from 'material-table';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import MuiAlert from '@material-ui/lab/Alert';
import Paper from '@material-ui/core/Paper';
import React from 'react';
import User from './User';
import axios from 'axios';

interface ListResponse {
    cases: Case[];
    nextPage: number;
    total: number;
}

interface LinelistTableState {
    url: string;
    error: string;
}

// Material table doesn't handle structured fields well, we flatten all fields in this row.
interface TableRow {
    id: string;
    // demographics
    sex: string;
    age: [number, number]; // start, end.
    ethnicity: string;
    // Represents a list as a comma and space separated string e.g. 'Afghan, Albanian'
    nationalities: string;
    profession: string;
    country: string;
    adminArea1: string;
    adminArea2: string;
    adminArea3: string;
    geoResolution: string;
    locationName: string;
    latitude: number;
    longitude: number;
    confirmedDate: Date | null;
    confirmationMethod: string;
    // Represents a list as a comma and space separated string e.g. 'fever, cough'
    symptoms: string;
    // Represents a list as a comma and space separated string e.g. 'vertical, iatrogenic'
    transmissionRoutes: string;
    // Represents a list as a comma and space separated string e.g. 'gym, hospital'
    transmissionPlaces: string;
    // Represents a list as a comma and space separated string e.g. 'caseId, caseId2'
    transmissionLinkedCaseIds: string;
    travelHistory: TravelHistory;
    pathogens: Pathogen[];
    // sources
    sourceUrl: string | null;
    notes: string;
    curatedBy: string;
}

// Cf. https://material-ui.com/guides/typescript/#augmenting-your-props-using-withstyles
interface Props extends RouteComponentProps {
    user: User;
}

class LinelistTable extends React.Component<Props, LinelistTableState> {
    constructor(props: Props) {
        super(props);
        this.state = {
            url: '/api/cases/',
            error: '',
        };
    }

    deleteCase(rowData: TableRow): Promise<unknown> {
        return new Promise((resolve, reject) => {
            const deleteUrl = this.state.url + rowData.id;
            this.setState({ error: '' });
            const response = axios.delete(deleteUrl);
            response.then(resolve).catch((e) => {
                this.setState({ error: e.toString() });
                reject(e);
            });
        });
    }

    render(): JSX.Element {
        const { history } = this.props;
        return (
            <Paper>
                {this.state.error && (
                    <MuiAlert elevation={6} variant="filled" severity="error">
                        {this.state.error}
                    </MuiAlert>
                )}
                <MaterialTable
                    columns={[
                        {
                            title: 'id',
                            field: 'id',
                            type: 'string',
                            hidden: true,
                        },
                        {
                            title: 'Sex',
                            field: 'sex',
                            lookup: { Female: 'Female', Male: 'Male' },
                        },
                        {
                            title: 'Age',
                            field: 'age',
                            render: (rowData) =>
                                rowData.age[0] === rowData.age[1]
                                    ? rowData.age[0]
                                    : `${rowData.age[0]}-${rowData.age[1]}`,
                        },
                        {
                            title: 'Ethnicity',
                            field: 'ethnicity',
                        },
                        {
                            title: 'Nationality',
                            field: 'nationalities',
                        },
                        {
                            title: 'Profession',
                            field: 'profession',
                        },
                        {
                            title: 'Location',
                            field: 'locationName',
                        },
                        {
                            title: 'Country',
                            field: 'country',
                        },
                        {
                            title: 'Confirmed date',
                            field: 'confirmedDate',
                            type: 'date',
                        },
                        {
                            title: 'Confirmation method',
                            field: 'confirmationMethod',
                        },
                        {
                            title: 'Symptoms',
                            field: 'symptoms',
                        },
                        {
                            title: 'Routes of transmission',
                            field: 'transmissionRoutes',
                        },
                        {
                            title: 'Places of transmission',
                            field: 'transmissionPlaces',
                        },
                        {
                            title: 'Contacted case IDs',
                            field: 'transmissionLinkedCaseIds',
                        },
                        {
                            title: 'Travel history',
                            field: 'travelHistory',
                            render: (rowData): string =>
                                rowData.travelHistory?.travel
                                    ?.map(
                                        (travel: Travel) =>
                                            travel.location?.name,
                                    )
                                    ?.join(', '),
                        },
                        {
                            title: 'Pathogens',
                            field: 'pathogens',
                            render: (rowData): string =>
                                rowData.pathogens
                                    ?.map((pathogen: Pathogen) => pathogen.name)
                                    ?.join(', '),
                        },
                        { title: 'Notes', field: 'notes' },
                        {
                            title: 'Source URL',
                            field: 'sourceUrl',
                        },
                        {
                            title: 'Curated by',
                            field: 'curatedBy',
                            tooltip:
                                'If unknown, this is most likely an imported case',
                        },
                    ]}
                    data={(query): Promise<QueryResult<TableRow>> =>
                        new Promise((resolve, reject) => {
                            let listUrl = this.state.url;
                            listUrl += '?limit=' + query.pageSize;
                            listUrl += '&page=' + (query.page + 1);
                            const trimmedQ = query.search.trim();
                            // TODO: We should probably use lodash.throttle on searches.
                            if (trimmedQ) {
                                listUrl +=
                                    '&q=' + encodeURIComponent(query.search);
                            }
                            this.setState({ error: '' });
                            const response = axios.get<ListResponse>(listUrl);
                            response
                                .then((result) => {
                                    const flattenedCases: TableRow[] = [];
                                    const cases = result.data.cases;
                                    for (const c of cases) {
                                        const confirmedEvent = c.events.find(
                                            (event) =>
                                                event.name === 'confirmed',
                                        );
                                        flattenedCases.push({
                                            id: c._id,
                                            sex: c.demographics?.sex,
                                            age: [
                                                c.demographics?.ageRange?.start,
                                                c.demographics?.ageRange?.end,
                                            ],
                                            ethnicity:
                                                c.demographics?.ethnicity,
                                            nationalities: c.demographics?.nationalities?.join(
                                                ', ',
                                            ),
                                            profession:
                                                c.demographics?.profession,
                                            country: c.location.country,
                                            adminArea1:
                                                c.location
                                                    ?.administrativeAreaLevel1,
                                            adminArea2:
                                                c.location
                                                    ?.administrativeAreaLevel2,
                                            adminArea3:
                                                c.location
                                                    ?.administrativeAreaLevel3,
                                            latitude:
                                                c.location?.geometry?.latitude,
                                            longitude:
                                                c.location?.geometry?.longitude,
                                            geoResolution:
                                                c.location?.geoResolution,
                                            locationName: c.location?.name,
                                            confirmedDate: confirmedEvent
                                                ?.dateRange?.start
                                                ? new Date(
                                                      confirmedEvent.dateRange.start,
                                                  )
                                                : null,
                                            confirmationMethod:
                                                confirmedEvent?.value || '',
                                            symptoms: c.symptoms?.values?.join(
                                                ', ',
                                            ),
                                            transmissionRoutes: c.transmission?.routes.join(
                                                ', ',
                                            ),
                                            transmissionPlaces: c.transmission?.places.join(
                                                ', ',
                                            ),
                                            transmissionLinkedCaseIds: c.transmission?.linkedCaseIds.join(
                                                ', ',
                                            ),
                                            travelHistory: c.travelHistory,
                                            pathogens: c.pathogens,
                                            notes: c.notes,
                                            sourceUrl:
                                                c.sources &&
                                                c.sources.length > 0
                                                    ? c.sources[0].url
                                                    : null,
                                            curatedBy:
                                                c.revisionMetadata
                                                    ?.creationMetadata
                                                    ?.curator || 'Unknown',
                                        });
                                    }
                                    resolve({
                                        data: flattenedCases,
                                        page: query.page,
                                        totalCount: result.data.total,
                                    });
                                })
                                .catch((e) => {
                                    this.setState({ error: e.toString() });
                                    reject(e);
                                });
                        })
                    }
                    title="COVID-19 cases"
                    options={{
                        search: true,
                        filtering: false,
                        sorting: false, // Would be nice but has to wait on indexes to properly query the DB.
                        padding: 'dense',
                        draggable: false, // No need to be able to drag and drop headers.
                        pageSize: 10,
                        pageSizeOptions: [5, 10, 20, 50, 100],
                        actionsColumnIndex: -1,
                    }}
                    actions={(this.props.user.roles.includes('curator')
                        ? [
                              {
                                  icon: 'add',
                                  tooltip: 'Submit new case',
                                  isFreeAction: true,
                                  onClick: (): void => {
                                      history.push('/cases/new');
                                  },
                              },
                              {
                                  icon: 'edit',
                                  tooltip: 'Edit this case',
                                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                  onClick: (_: any, row: any): void => {
                                      // Somehow the templating system doesn't think row has an id property but it has.
                                      const id = (row as TableRow).id;
                                      history.push(`/cases/edit/${id}`);
                                  },
                              },
                          ]
                        : []
                    ).concat([
                        {
                            icon: 'details',
                            tooltip: 'View this case details',
                            onClick: (e, row): void => {
                                // Somehow the templating system doesn't think row has an id property but it has.
                                const id = (row as TableRow).id;
                                history.push(`/cases/view/${id}`);
                            },
                        },
                    ])}
                    editable={
                        this.props.user.roles.includes('curator')
                            ? {
                                  onRowDelete: (
                                      rowData: TableRow,
                                  ): Promise<unknown> =>
                                      this.deleteCase(rowData),
                              }
                            : undefined
                    }
                />
            </Paper>
        );
    }
}

export default withRouter(LinelistTable);
