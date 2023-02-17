import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import propTypes from 'prop-types';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import { Text, TextContent, Stack, StackItem } from '@patternfly/react-core';
import { pluralize, ISSUES_MULTIPLE, SYSTEMS } from '../../../Utilities/utils';
import './reviewActions.scss';
import './issueResolutionSelections.scss';
import IssueResolutionSelections from './issueResolutionSelections';
import { TableComposable, Tr } from '@patternfly/react-table';
import { useFieldApi } from '@data-driven-forms/react-form-renderer';

const ReviewActions = (props) => {
  const formOptions = useFormApi();
  const { input } = useFieldApi(props);
  const values = formOptions.getState().values;
  const [issuesMultiple, setIssuesMultiple] = useState(values[ISSUES_MULTIPLE]);
  useEffect(() => {
    setIssuesMultiple(values[ISSUES_MULTIPLE]);
  }, []);

  const getMultipleResolutions = () => {
    let multipleResolutions = issuesMultiple?.filter((issue) => {
      return issue.resolutions.length > 1;
    });

    return multipleResolutions;
  };

  const [issuesWithMultipleResolutions, setIssuesWithMultipleResolutions] =
    useState(getMultipleResolutions());

  const [radioSelected, setRadioSelected] = useState(
    Array(issuesWithMultipleResolutions?.length).fill(false)
  );

  const issues = props.issues.filter((issue) =>
    Object.keys(values[SYSTEMS]).includes(issue.id)
  );

  const allSystemsNamed = useSelector(
    ({ hostReducer: { hosts } }) =>
      hosts?.map((host) => ({ id: host.id, name: host.display_name })) || []
  );

  const handleRadioSelection = (issue, resolution, issueIndex) => {
    let issuesMultipleCopy = issuesMultiple;
    let foundIssue = issuesMultiple?.find((item) => {
      return item.action === issue.action;
    });

    foundIssue.resolutions.map((res) => {
      if (resolution.description === res.description) {
        return (res.selected = true);
      } else {
        return (res.selected = false);
      }
    });

    issuesMultipleCopy.forEach((item) => {
      if (item.action === foundIssue.action) {
        item = foundIssue;
      }
    });

    setIssuesMultiple(issuesMultipleCopy);
    setIssuesWithMultipleResolutions(getMultipleResolutions());
    let radioSelectedCopy = radioSelected;
    radioSelectedCopy[issueIndex] = true;
    setRadioSelected(radioSelectedCopy);
    input.onChange(radioSelectedCopy);
    formOptions.change(ISSUES_MULTIPLE, issuesMultipleCopy);
  };

  return (
    <Stack hasGutter data-component-ouia-id="wizard-review-actions">
      <StackItem>
        <TextContent>
          <Text>
            <b>
              {`${getMultipleResolutions().length}`} of the {`${issues.length}`}{' '}
              selected {`${pluralize(issues.length, 'issue')}`}
            </b>{' '}
            to add to this playbook require additional review.
            <br />
            <br />
            There are multiple playbooks available to resolve or mitigate the{' '}
            following issues. Select the desired playbook for each issue. The{' '}
            recommended playbook for most use cases is pre-selected.
          </Text>
        </TextContent>
      </StackItem>
      <StackItem>
        <TableComposable>
          {issuesWithMultipleResolutions.map((issue, index) => {
            return (
              <IssueResolutionSelections
                allSystemsNamed={allSystemsNamed}
                key={`${issue.action}`}
                issue={issue}
                handleRadioSelection={handleRadioSelection}
                issueIndex={index}
              />
            );
          })}
          <Tr className="resolutions-review-table-rows" />
        </TableComposable>
      </StackItem>
    </Stack>
  );
};

ReviewActions.propTypes = {
  issues: propTypes.arrayOf(
    propTypes.shape({
      description: propTypes.string,
      id: propTypes.string,
    })
  ).isRequired,
};

export default ReviewActions;
