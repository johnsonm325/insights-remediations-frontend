import React, { useState } from 'react';
import propTypes from 'prop-types';
import {
  ExpandableSection,
  Icon,
  Radio,
  TextContent,
  Text,
  TextVariants,
} from '@patternfly/react-core';
import { PowerOffIcon } from '@patternfly/react-icons';
import { buildSystemRow } from '../../../Utilities/utils';
import { Td, Tr } from '@patternfly/react-table';
import './issueResolutionSelections.scss';
import { c_expandable_section__toggle_Color } from '@patternfly/react-tokens';
import { c_expandable_section__toggle_focus_Color } from '@patternfly/react-tokens';
import { c_expandable_section__toggle_hover_Color } from '@patternfly/react-tokens';
import { c_expandable_section__content_MarginTop } from '@patternfly/react-tokens';
import { global_Color_100 } from '@patternfly/react-tokens';

const RadioLabel = ({ resolution }) => {
  const rebootRequired = () => {
    return resolution.needs_reboot ? (
      <div>
        <Icon status="danger" style={{ marginRight: '8px' }}>
          <PowerOffIcon />
        </Icon>
        <b>Reboot required</b>
      </div>
    ) : (
      <div>
        <Icon>
          <PowerOffIcon color="#6a6e73" style={{ marginRight: '8px' }} />
        </Icon>
        <span>Reboot not required</span>
      </div>
    );
  };

  return (
    <React.Fragment>
      <TextContent>
        <Text>
          <b>{resolution.description}</b>
        </Text>
        <Text>{rebootRequired()}</Text>
      </TextContent>
    </React.Fragment>
  );
};

RadioLabel.propTypes = {
  resolution: propTypes.object,
  issue: propTypes.array,
};

const IssueResolutionSelections = ({
  allSystemsNamed,
  issue,
  handleRadioSelection,
  issueIndex,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [systemsExpanded, setSystemsExpanded] = useState(false);

  const handleSystemsToggle = (isExpanded) => {
    setSystemsExpanded(isExpanded);
  };

  const handleExpansionToggle = (isExpanded) => {
    setExpanded(!isExpanded);
  };

  const renderParentRow = (parent) => {
    let parentRow = (
      <Tr>
        <ExpandableSection
          style={{
            [c_expandable_section__toggle_Color.name]: global_Color_100.var,
            [c_expandable_section__toggle_focus_Color.name]:
              global_Color_100.var,
            [c_expandable_section__toggle_hover_Color.name]:
              global_Color_100.var,
            paddingTop: '16px',
            [c_expandable_section__content_MarginTop.name]: '0px',
          }}
          toggleText={
            <TextContent>
              <Text component={TextVariants.h3}>{parent.id}</Text>
            </TextContent>
          }
          onToggle={() => handleExpansionToggle(expanded)}
          isExpanded={expanded}
        >
          {renderChildRow(issue)}
        </ExpandableSection>
      </Tr>
    );

    return parentRow;
  };

  const renderChildRow = (child) => {
    let childRow = (
      <div>
        <Tr
          style={{ borderBottom: '0', borderTop: '0' }}
          className={expanded === true ? 'pf-m-expanded' : null}
          isExpanded={expanded === true}
        >
          <Td style={{ paddingLeft: '64px' }}>
            {child.resolutions.map((resolution, index) => {
              return (
                <div
                  style={{ paddingTop: '16px' }}
                  key={`${issue.action}-${index}`}
                >
                  <Radio
                    id={`${issue.action}-${index}`}
                    label={<RadioLabel resolution={resolution} issue={issue} />}
                    isChecked={resolution.selected || false}
                    onChange={() =>
                      handleRadioSelection(issue, resolution, issueIndex)
                    }
                  />
                </div>
              );
            })}
          </Td>
        </Tr>
        <div style={{ paddingLeft: '32px' }}>
          <ExpandableSection
            style={{
              [c_expandable_section__toggle_Color.name]: global_Color_100.var,
              [c_expandable_section__toggle_focus_Color.name]:
                global_Color_100.var,
              [c_expandable_section__toggle_hover_Color.name]:
                global_Color_100.var,
              paddingTop: '16px',
              [c_expandable_section__content_MarginTop.name]: '0px',
            }}
            toggleText={`Affected systems (${issue.systems.length})`}
            onToggle={handleSystemsToggle}
            isExpanded={systemsExpanded}
          >
            {buildSystemRow(allSystemsNamed, child.systems, 'systems-table')}
          </ExpandableSection>
        </div>
      </div>
    );

    return childRow;
  };

  return <React.Fragment>{renderParentRow(issue)}</React.Fragment>;
};

IssueResolutionSelections.propTypes = {
  allSystemsNamed: propTypes.array,
  handleRadioSelection: propTypes.func,
  issue: propTypes.array,
  issueIndex: propTypes.number,
};

export default IssueResolutionSelections;
