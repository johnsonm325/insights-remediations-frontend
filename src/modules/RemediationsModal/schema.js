import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import {
  SELECT_PLAYBOOK,
  MANUAL_RESOLUTION,
  EXISTING_PLAYBOOK,
  EXISTING_PLAYBOOK_SELECTED,
  AUTO_REBOOT,
  SYSTEMS,
  ISSUES_MULTIPLE,
  RESOLUTIONS,
} from '../../Utilities/utils';

export const selectPlaybookFields = [
  {
    name: SELECT_PLAYBOOK,
    component: 'select-playbook',
    validate: [
      {
        type: validatorTypes.PATTERN,
        pattern: /^$|^.*[\w\d]+.*$/,
      },
      {
        type: validatorTypes.REQUIRED,
      },
    ],
  },
  {
    name: EXISTING_PLAYBOOK_SELECTED,
    component: componentTypes.TEXT_FIELD,
    hideField: true,
  },
  {
    name: EXISTING_PLAYBOOK,
    component: componentTypes.TEXT_FIELD,
    hideField: true,
  },
  {
    name: RESOLUTIONS,
    component: componentTypes.TEXT_FIELD,
    hideField: true,
  },
];

export const reviewActionsFields = [
  {
    name: MANUAL_RESOLUTION,
    component: 'review-actions',
    isRequired: true,
    validate: [{ type: 'validate-resolutions-selected' }],
  },
];

export const reviewActionsNextStep = (values) => {
  const filteredIssues = values[EXISTING_PLAYBOOK_SELECTED]
    ? values[ISSUES_MULTIPLE].filter(
        (issue) =>
          !values[EXISTING_PLAYBOOK].issues.some((i) => i.id === issue.id) &&
          Object.keys(values[SYSTEMS]).includes(issue.id)
      )
    : values[ISSUES_MULTIPLE].filter((issue) =>
        Object.keys(values[SYSTEMS]).includes(issue.id)
      );

  return values[MANUAL_RESOLUTION] ? filteredIssues[0]?.id : 'review';
};

export const issueResolutionNextStep = (values, issue) => {
  const filteredIssues = values[EXISTING_PLAYBOOK_SELECTED]
    ? values[ISSUES_MULTIPLE].filter(
        (issue) =>
          !values[EXISTING_PLAYBOOK].issues.some(
            (i) =>
              i.id === issue.id &&
              Object.keys(values[SYSTEMS]).includes(issue.id)
          )
      )
    : values[ISSUES_MULTIPLE].filter((issue) =>
        Object.keys(values[SYSTEMS]).includes(issue.id)
      );
  return (
    filteredIssues.slice(
      filteredIssues.findIndex((i) => i.id === issue.id) + 1,
      filteredIssues.length
    )[0]?.id || 'review'
  );
};

export const reviewSystemsNextStep = (values) => {
  const filteredIssues = values[EXISTING_PLAYBOOK_SELECTED]
    ? values[ISSUES_MULTIPLE].filter(
        (issue) =>
          !values[EXISTING_PLAYBOOK].issues.some(
            (i) =>
              i.id === issue.id &&
              Object.keys(values[SYSTEMS]).includes(issue.id)
          )
      )
    : values[ISSUES_MULTIPLE].filter((issue) =>
        Object.keys(values[SYSTEMS]).includes(issue.id)
      );

  return filteredIssues.some((filteredIssue) => {
    return filteredIssue.resolutions.length > 1;
  })
    ? 'actions'
    : 'review';
};

export default () => ({
  fields: [
    {
      component: componentTypes.WIZARD,
      name: 'remediations-wizard',
      isDynamic: true,
      inModal: true,
      showTitles: true,
      title: 'Remediate with Ansible',
      description: 'Add actions to an Ansible Playbook',
      fields: [
        {
          name: 'playbook',
          title: 'Select playbook',
          fields: selectPlaybookFields,
          nextStep: 'systems',
        },
        {
          name: 'systems',
          title: 'Review systems',
          fields: [
            {
              name: SYSTEMS,
              component: 'review-systems',
              validate: [{ type: 'validate-systems' }],
            },
          ],
          nextStep: ({ values }) => reviewSystemsNextStep(values),
        },
        {
          name: 'actions',
          title: 'Issues with multiple resolutions',
          fields: reviewActionsFields,
          nextStep: 'review',
          substepOf: 'Review and edit actions',
        },
        {
          name: 'review',
          title: 'Remediation review',
          fields: [
            {
              name: AUTO_REBOOT,
              component: 'review',
            },
          ],
        },
      ],
    },
  ],
});
