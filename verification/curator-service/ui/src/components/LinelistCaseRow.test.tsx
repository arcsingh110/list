import LinelistCaseRow from './LinelistCaseRow';
import React from 'react';
import displayDate from '../util/display-date';
import { render } from '@testing-library/react';

it('renders provided case', () => {
  const id = 'abc123';
  const outcome = 'pending';
  const date = new Date();

  const { getByText } = render(
    <table>
      <tbody>
        <LinelistCaseRow
          case={
            {
              _id: id,
              outcome: outcome,
              eventSequence: {
                confirmed: date
              }
            }}
        />
      </tbody>
    </table>
  );

  expect(getByText(new RegExp(id))).toBeInTheDocument();
  expect(getByText(new RegExp(outcome))).toBeInTheDocument();
  expect(getByText(new RegExp(displayDate(date)))).toBeInTheDocument();
});