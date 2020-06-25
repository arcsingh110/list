import { DateField, SelectField } from './FormikFields';
import { FieldArray, useFormikContext } from 'formik';

import AddCircleIcon from '@material-ui/icons/AddCircle';
import Button from '@material-ui/core/Button';
import Location from './Location';
import NewCaseFormValues from './NewCaseFormValues';
import { PlacesAutocomplete } from './LocationForm';
import React from 'react';
import Scroll from 'react-scroll';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
    travelHistorySection: {
        margin: '1em',
    },
}));

// TODO: get values from DB.
const travelPurposes = [undefined, 'Business', 'Leisure', 'Family', 'Other'];

const travelMethods = [
    undefined,
    'Bus',
    'Car',
    'Coach',
    'Ferry',
    'Plane',
    'Train',
    'Other',
];

export default function Events(): JSX.Element {
    const { values } = useFormikContext<NewCaseFormValues>();
    const classes = useStyles();
    return (
        <Scroll.Element name="travelHistory">
            <fieldset>
                <legend>Travel History</legend>
                <FieldArray name="travelHistory">
                    {({ push }): JSX.Element => {
                        return (
                            <div>
                                {values.travelHistory &&
                                    values.travelHistory.map(
                                        (travelHistoryElement, index) => (
                                            <fieldset
                                                key={index}
                                                className={
                                                    classes.travelHistorySection
                                                }
                                            >
                                                <PlacesAutocomplete
                                                    name={`travelHistory[${index}].location`}
                                                ></PlacesAutocomplete>
                                                <Location
                                                    location={
                                                        travelHistoryElement.location
                                                    }
                                                ></Location>
                                                <DateField
                                                    name={`travelHistory[${index}].dateRange.start`}
                                                    label="Start date"
                                                ></DateField>
                                                <DateField
                                                    name={`travelHistory[${index}].dateRange.end`}
                                                    label="End date"
                                                ></DateField>
                                                <SelectField
                                                    name={`travelHistory[${index}].purpose`}
                                                    label="Primary reason for travel"
                                                    values={travelPurposes}
                                                ></SelectField>
                                                <SelectField
                                                    name={`travelHistory[${index}].method`}
                                                    label="Method of travel"
                                                    values={travelMethods}
                                                ></SelectField>
                                            </fieldset>
                                        ),
                                    )}

                                <Button
                                    data-testid="addTravelHistory"
                                    startIcon={<AddCircleIcon />}
                                    onClick={(): void => {
                                        push({
                                            dateRange: {
                                                start: null,
                                                end: null,
                                            },
                                        });
                                    }}
                                >
                                    Add travel history
                                </Button>
                            </div>
                        );
                    }}
                </FieldArray>
            </fieldset>
        </Scroll.Element>
    );
}
