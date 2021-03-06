import { Field, useFormikContext } from 'formik';
import { Typography, makeStyles } from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import { Autocomplete } from '@material-ui/lab';
import Button from '@material-ui/core/Button';
import CaseFormValues from './CaseFormValues';
import FieldTitle from '../common-form-fields/FieldTitle';
import { Location as Loc } from '../Case';
import Location from './Location';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import React from 'react';
import { RequiredHelperText } from '../common-form-fields/FormikFields';
import Scroll from 'react-scroll';
import { TextField } from 'formik-material-ui';
import axios from 'axios';
import { hasKey } from '../Utils';
import throttle from 'lodash/throttle';

function LocationForm(): JSX.Element {
    const { values, initialValues, setFieldValue } = useFormikContext<
        CaseFormValues
    >();
    return (
        <Scroll.Element name="location">
            <fieldset>
                <FieldTitle title="Location"></FieldTitle>
                <PlacesAutocomplete
                    initialValue={initialValues.location?.name}
                    name="location"
                    required
                />
                {!values.location && (
                    <Button
                        variant="outlined"
                        color="default"
                        id="add-location"
                        startIcon={<AddIcon />}
                        onClick={() => setFieldValue('location', {})}
                    >
                        Specify geocode manually
                    </Button>
                )}
                {values.location && (
                    <Location
                        locationPath="location"
                        geometry={values.location?.geometry}
                    />
                )}
            </fieldset>
        </Scroll.Element>
    );
}

export default LocationForm;

const useStyles = makeStyles((theme) => ({
    icon: {
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(2),
    },
    suggestion: {
        display: 'flex',
        alignItems: 'center',
    },
}));

interface PlacesAutocompleteProps {
    name: string;
    required?: boolean;
    initialValue?: string;
}

// Place autocomplete, based on
// https://material-ui.com/components/autocomplete/#google-maps-place
export function PlacesAutocomplete(
    props: PlacesAutocompleteProps,
): JSX.Element {
    const classes = useStyles();
    const [value, setValue] = React.useState<Loc | null>(null);
    const [inputValue, setInputValue] = React.useState('');
    const [options, setOptions] = React.useState<Loc[]>([]);
    const { setFieldValue, setTouched, touched } = useFormikContext<
        CaseFormValues
    >();

    const fetch = React.useMemo(
        () =>
            throttle(
                async (
                    request: { q: string },
                    callback: (results?: Loc[]) => void,
                ) => {
                    const resp = await axios.get<Loc[]>(
                        '/api/geocode/suggest',
                        {
                            params: request,
                        },
                    );
                    callback(resp.data);
                },
                250,
            ),
        [],
    );

    React.useEffect(() => {
        let active = true;

        if (inputValue.trim() === '') {
            setOptions(value ? [value] : []);
            return undefined;
        }

        fetch({ q: inputValue }, (results?: Loc[]) => {
            if (active) {
                let newOptions = [] as Loc[];

                if (results) {
                    newOptions = [...newOptions, ...results];
                }

                setOptions(newOptions);
            }
        });

        return (): void => {
            active = false;
        };
    }, [value, inputValue, fetch]);

    return (
        <Autocomplete
            itemType="Loc"
            getOptionLabel={(option: Loc): string => option.name}
            options={options}
            value={value}
            onChange={(event: any, newValue: Loc | null): void => {
                setOptions(newValue ? [newValue, ...options] : options);
                setValue(newValue);
                setFieldValue(props.name, newValue);
            }}
            onBlur={(): void => setTouched({ [props.name]: true })}
            onInputChange={(event, newInputValue): void => {
                setInputValue(newInputValue);
            }}
            noOptionsText="No locations found, type to search"
            renderInput={(params): JSX.Element => (
                <>
                    {/* Do not use FastField here */}
                    <Field
                        {...params}
                        // Setting the name properly allows any typed value
                        // to be set in the form values, rather than only selected
                        // dropdown values. Thus we use an unused form value here.
                        name="unused"
                        data-testid={props.name}
                        // Use the initial valuelocation name as a hint when untouched
                        // otherwise just use the field name.
                        label={
                            hasKey(touched, props.name)
                                ? 'Location'
                                : props.initialValue || 'Location'
                        }
                        component={TextField}
                        fullWidth
                    ></Field>
                    {props.required && (
                        <RequiredHelperText
                            name={props.name}
                        ></RequiredHelperText>
                    )}
                </>
            )}
            renderOption={(option: Loc): React.ReactNode => {
                return (
                    <span className={classes.suggestion}>
                        <LocationOnIcon className={classes.icon} />
                        <Typography variant="body2">{option.name}</Typography>
                    </span>
                );
            }}
        />
    );
}
