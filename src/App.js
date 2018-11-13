import React, { Component } from 'react';
import swal from 'sweetalert';
import logo from './logo.svg';
import '../node_modules/sweetalert/dist/sweetalert.css';
import '../node_modules/fdns-ui-react/dist/styles/fdns-ui-react.css';
import './App.css';
import {
  Container, Uploader, FilterSelect, IconButton, DropdownUser
} from 'fdns-ui-react';
import { mmgs, secureMode, jurisdictions } from './defaults';
import AdminModal from './AdminModal';

import FDNS from 'fdns-js-sdk';

const fdns = new FDNS({
  HL7_UTILS_URL: window.config.HL7_UTILS_URL,
  COMBINER_URL: window.config.COMBINER_URL
});

var promises = [];

class App extends Component {

  // init
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      user: {},
      admin: false,
    };
  }

  // handle help event
  handleHelp = () => {
    swal('Help', '"To use this tool, begin by pasting your HL7 file or drag and drop the files into the container. From there, select your Jurisdiction and MMG and then select combine. Thank you!', 'info');
  }

  // handle new batch event
  handleNewBatch = () => {
    swal({
      title: 'Are you sure?',
      text: 'Are you sure you want to begin a new batch?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, new batch please!',
      closeOnConfirm: true
    }, () => {
      window.location.reload();
    });
  }

  // handle any errors from the uploader
  handleUploadError = (error) => {
    switch(error.message) {
      case 'Duplicate file detected':
        swal('Uh oh', 'We detected a duplicate file in this batch!', 'error');
        break;
      default:
        break;
    }
  }

  // start the loading indicator
  startLoading = () => {
    this.setState({
      loading: true,
    });
  }

  // stop the loading indicator
  stopLoading = () => {
    this.setState({
      loading: false,
    });
  }

  // parse file from the HL7 utils microservice
  parseFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      // on load event
      reader.onloadend = () => {

        // parse raw HL7 to JSON
        const opts = {
          spec: "phinms",
          message: reader.result
        }

        fdns.hl7.toJSON(opts)
          .then(res => {
            resolve({
              json: JSON.stringify(res.data.message.HL7.source),
              filename: file.name,
            });
          })
          .catch((textStatus, errorThrown) => {
            this.stopLoading();
            console.log(textStatus, errorThrown);
            swal('Uh oh', 'Something went wrong!', 'error');
          })
      }

      // on error event
      reader.onerror = (err) => {
        reject(err);
      }

      // read the file
      reader.readAsText(file);
    });
  }

  // handle the combine event
  handleCombine = () => {
    promises = [];

    const jurisdiction = this.refs.jurisdiction.apply().value;
    const mmg = this.refs.mmg.apply().value;
    let valid = true;
    let error = '';

    // check for jurisdiction selection
    if (jurisdiction.length === 0) {
      valid = false;
      error = 'Looks like you are missing the jurisdiction!';
    }

    // check for MMG selection
    if (mmg.length === 0) {
      valid = false;
      error = 'Looks like you are missing the MMG!';
    }

    // check for uploaded files
    if (this.refs.uploader.state.files.length === 0) {
      valid = false;
      error = 'Looks like you didn\'t select any files';
    }

    // make sure we have both values for the filename
    if (valid) {
      this.startLoading();
      const combinedFilename = `${jurisdiction}_${mmg}_${new Date().getTime()}.xlsx`;
      const mmgConfigName = `mmg-${mmg.toLowerCase()}`;

      // setup the promises
      this.refs.uploader.state.files.map((file, i) => {
        return promises.push(this.parseFile(file));
      });

      // execute all promises
      Promise.all(promises).then(results => {
        this.uploadFiles(results, combinedFilename, mmgConfigName);
      }).catch(reason => {
        console.log(reason);
      });
    } else {
      swal('Uh oh', error, 'error');
    }
  }

  // upload the files
  uploadFiles = (results, combinedFilename, mmg) => {
    const fdata = new FormData();

    // read all of the parsed files
    results.map((result, i) => {
      const { json, filename } = result;
      const parsedFile = new Blob([json]);
      return fdata.append('file', parsedFile, filename);
    });

    // call the combiner microservice
    const opts = {
      file: fdata,
      filename: combinedFilename,
      config: mmg,
      responseType: 'blob'
    }
    fdns.combiner.export(opts)
      .then(res => {
        this.stopLoading();
        this.refs.uploader.reset();

        // use msSaveBlob if it exists
        if (typeof(window.navigator.msSaveBlob) === 'function') {
          window.navigator.msSaveBlob(res.data, combinedFilename);
        } else {
          const link = document.createElement('a');

          link.href = window.URL.createObjectURL(res.data);
          link.download = combinedFilename;
          link.click();
        }
      })
      .catch(err => {
        this.stopLoading();
        console.log(err);
        swal('Uh oh', 'Something went wrong!', 'error');
      })
  }

  // handle the sign out action
  handleSignOut = () => {
    // TODO: remove local storage of acccess token
    const parts = window.location.href.split('?');
    window.location.href = parts[0];
  }

  // handle admin btn click
  handleAdminShow = (admin) => {
    this.setState({
      admin,
    });
  }

  // render the loader (or not)
  renderLoader() {
    if (!this.state.loading) return;
    return (
      <div className="loader">
        <div className="text-center">
          <i className="fa fa-circle-o-notch fa-spin"></i>
          <span>Building file...</span>
        </div>
      </div>
    );
  }

  // render the dropdown user based on secureMode or not
  renderNav() {
    let userSplitCmp;
    let userCmp;

    // if secureMode show the user info
    if (secureMode) {
      const { user } = this.state;
      userSplitCmp = <span className="splitter"></span>;
      userCmp = <DropdownUser user={user} onSignOut={this.handleSignOut} />;
    }

    // return with the nav
    return (
      <nav>
        <img src={logo} className="logo" alt="Onboarding Tool" />
        <div className="icon-buttons pull-right">
          <IconButton theme="light" icon="sync-alt" bsStyle="transparent" onClick={this.handleNewBatch}>New Batch</IconButton>
          <span className="splitter"></span>
          <IconButton theme="light" icon="life-ring" bsStyle="transparent" onClick={this.handleHelp}>Help</IconButton>
          {userSplitCmp}
          {userCmp}
        </div>
        <div className="clearfix"></div>
      </nav>
    )
  }

  // main render method
  render() {
    const { admin } = this.state;
    const footerTxt = 'This app is a prototype meant for testing new user interface concepts |  Hippocratia Disease Research Center  |  Hippocratia Department of Health & Human Services';

    const jurisdictionsMapped = jurisdictions.map((jurisdiction) => {
      const { preferredConceptName } = jurisdiction;
      return {
        label: preferredConceptName,
        value: preferredConceptName,
      }
    });

    return (
      <div className="app">
        {this.renderLoader()}
        {this.renderNav()}
        <Container>
          <div className="row">
            <div className="col col-md-8">
              <Uploader ref="uploader" handleError={this.handleUploadError} />
            </div>
            <div className="col col-md-4">
              <div className="blue-box">
                <FilterSelect icon={["far", "hospital"]} ref="jurisdiction" label="Select Jurisdiction" placeholder="Jurisdiction" options={jurisdictionsMapped} />
                <FilterSelect icon={["far","file-code"]} ref="mmg" label="Select Message Mapping Guide (MMG)" placeholder="Message Mapping Guide" options={mmgs} />
                <div className="icon-buttons pull-right">
                  <IconButton icon="sync-alt" bsStyle="clear" onClick={this.handleNewBatch}>New Batch</IconButton>
                  <IconButton icon="cogs" bsStyle="alternate" onClick={this.handleCombine}>Combine Files</IconButton>
                </div>
                <div className="clearfix"></div>
              </div>
            </div>
          </div>
        </Container>
        <footer>
          {footerTxt}
          {
            secureMode ? (
              <IconButton theme="light" bsStyle="transparent" icon="cogs" onClick={this.handleAdminShow.bind(null, true)}>Admin</IconButton>
            ) : null
          }
        </footer>
        <AdminModal admin={admin} onHide={this.handleAdminShow} fdns={fdns} />
      </div>
    );
  }
}

export default App;
