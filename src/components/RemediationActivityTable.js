import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import {
    Table,
    TableHeader,
    TableBody,
    expandable
} from '@patternfly/react-table';

import { statusSummary, normalizeStatus } from './statusHelper';

import { PermissionContext } from '../App';

const RemediationActivityTable = ({ remediation, playbookRuns }) => {

    const [ rows, setRows ] = useState([]);
    const permission = useContext(PermissionContext);

    useEffect(() => {
        if (playbookRuns && playbookRuns.length) {
            setRows(() => generateRows(playbookRuns));
        }
    }, [ playbookRuns ]);
        

    const systemsStatus = { running: 1, success: 2, failure: 1 };

    console.log(playbookRuns);

    const generateRows = (playbookRuns) => {
        return (playbookRuns.reduce((acc, playbooks, i) => (
            [
                {
                    isOpen: false,
                    cells: [
                        { title: <Link to={ `/${remediation.id}/${playbooks.id}` }> { playbooks.created_at } </Link>,
                            cellFormatters: [ expandable ]},
                        `${playbooks.created_by.first_name} ${playbooks.created_by.last_name}`,
                        { title: statusSummary(normalizeStatus(playbooks.status), systemsStatus, permission) }
                    ]
                }, {
                    parent: 2 * i,
                    fullWidth: true,
                    cells: [{
                        title: <Table
                            aria-label="Compact expandable table"
                            cells={ [ 'Connection', 'Systems', 'Playbook runs status' ] }
                            rows={ playbooks.executors.map(e => (
                                { cells: [
                                    { title: <Link to={ `/${remediation.id}/${playbooks.id}/${e.executor_id}` }>{ e.executor_name }</Link> },
                                    e.system_count,
                                    { title: statusSummary(normalizeStatus(playbooks.status), systemsStatus, permission, true) }
                                ]}
                            )) }
                        >
                            <TableHeader />
                            <TableBody />
                        </Table>
                    }]
                }
            ]
        ), []));
    };

    const handleOnCollapse = (event, rowId, isOpen) => {
        const collapseRows = [ ...rows ];
        collapseRows[rowId] = { ...collapseRows[rowId], isOpen };
        setRows(collapseRows);
    };

    const columns = [
        'Run on',
        'Run by',
        'Status'
    ];

    return (
        <Table aria-label="Collapsible table" onCollapse={ handleOnCollapse } rows={ rows } cells={ columns }>
            <TableHeader />
            <TableBody />
        </Table>
    );
};

RemediationActivityTable.propTypes = {
    remediation: PropTypes.object,
    playbookRuns: PropTypes.array
};

export default RemediationActivityTable;
