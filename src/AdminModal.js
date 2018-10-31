import React, { Component } from 'react';
import swal from 'sweetalert';
import {
  IconButton, FormControl, ControlLabel, Form, FormGroup, Modal
} from 'fdns-ui-react/';
import { mmgs } from './defaults';

class AdminModal extends Component {
  // init
  constructor(props) {
    super(props);
    this.state = {
      admin: {},
      adminConfig: '',
      // Set a default value for if a user doesn't change the dropdown
      adminMMG: mmgs[0].value
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.admin) this.syncConfigs();
  }

  // grab mmg configs
  syncConfigs = () => {
    const admin = this.state.admin;

    // iterate through each mmg
    mmgs.forEach((mmgObj) => {
      const mmg = mmgObj.value.toLowerCase()
      const config = `mmg-${mmg}`;

      // check for the mmg and set state accordingly
      this.props.fdns.combiner.getConfig({config: config})
        .then(res => {
          admin[mmg] = true;
          this.setState({
            admin,
          });
        })
        .catch(err => {
          admin[mmg] = false;
          this.setState({
            admin,
          });
        })
    });
  }

  // handle admin config change
  handleAdminConfigChange = (e) => {;
    this.setState({
      adminConfig: e.target.value,
    });
  }

  // handle admin MMG change
  handleAdminMMGChange = (e) => {;
    this.setState({
      adminMMG: e.target.value,
    });
  }

  // handle the admin submit
  handleAdminSubmit = () => {
    const { adminConfig:payload, adminMMG } = this.state;

    const opts = {
      config: `mmg-${adminMMG.toLowerCase()}`,
      payload: payload
    }

    this.props.fdns.combiner.createConfig(opts)
      .then(res => {
        swal('Success', 'Config successfully updated', 'success');
        this.syncConfigs();
      })
      .catch((err, errText) => {
        let errorMessage = 'Something went wrong!';
        if (err.response) errorMessage = err.response.data.message;
        swal('Uh oh', errorMessage, 'error');
      })
  }

  // main render
  render() {
    const { admin, adminConfig, adminMMG } = this.state;
    const adminMMGs = Object.keys(admin).map((mmg, i) => {
      const label = `mmg-${mmg}`;
      const valid = admin[mmg];

      if (valid) return <li key={i} style={{ color: 'green' }}>&#10003; {label}</li>;
      return <li key={i} style={{ color: 'red' }}>&times; {label}</li>;
    });

    const adminModal = (
      <Modal show={this.props.admin} onHide={this.props.onHide.bind(null, false)}>
        <Modal.Header closeButton>
          <Modal.Title>MMG Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Configs Loaded</h4>
          <ul>{adminMMGs}</ul>
          <Form>
            <FormGroup>
              <FormControl componentClass="select" placeholder="Message Mapping Guide" value={adminMMG} onChange={this.handleAdminMMGChange}>
                {mmgs.map((mmg, i) => <option key={i} value={mmg.value}>{mmg.label}</option>)}
              </FormControl>
            </FormGroup>
            <FormGroup>
              <ControlLabel>Config JSON</ControlLabel>
              <FormControl componentClass="textarea" placeholder="Config" value={adminConfig} onChange={this.handleAdminConfigChange} />
            </FormGroup>
            <FormGroup>
              <IconButton bsStyle="primary" icon="paper-plane" onClick={this.handleAdminSubmit}>Submit</IconButton>
            </FormGroup>
          </Form>
        </Modal.Body>
      </Modal>
    );

    return adminModal;
  }
}

export default AdminModal;
