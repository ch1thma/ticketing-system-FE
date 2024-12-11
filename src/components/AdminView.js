//import React, { useState } from 'react';
import React, { useState, useEffect } from 'react';
import { addVendorBeforeSession, addVendorDuringSession, getAllVendors, getSessionStatus, resetSimulation, startSimulation, stopSimulation, submitConfig } from '../services/api';
import WebSocketService from '../services/webSocketService';
import '../App.css';

function AdminDashboard() {

  

  //Configuration form
  const [ticketsConfig, setTicketsConfig] = useState({
    maxCapacity: "",
    totalTickets: "",
    releaseRate: "",
    retrievalRate: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isValidConfigForm, setIsValidConfigForm] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [sessionStatus, setSessionStatus] = useState("stopped"); // Default session status
  const [logs, setLogs] = useState([]);
  const [isConfigSubmitted, setIsConfigSubmitted] = useState(false);
  const [isResetSessionClicked, setIsResetSessionClicked] = useState(true); // Tracks if the session was reset
  const isSubmitConfigDisabled = sessionStatus === "running" || !isResetSessionClicked;
  


  const handleConfigChange = (field, value) => {
    const updatedConfig = { ...ticketsConfig, [field]: value > 0 ? value : "" };
    setTicketsConfig(updatedConfig);
  
    // Check for invalid inputs
    if (value <= 0) {
      setErrorMessage("Negative values and 0 are not accepted !");
    } else {
      setErrorMessage(""); // Clear the error message when input is valid
    }

    // Check form validity after updating
    const isValid =
      updatedConfig.maxCapacity > 0 &&
      updatedConfig.totalTickets > 0 &&
      updatedConfig.releaseRate > 0 &&
      updatedConfig.retrievalRate > 0;
  
    setIsValidConfigForm(isValid);
  };
  

  const handleConfigSubmit = async () => {
    try {
      const configData = await submitConfig(ticketsConfig);

      if(configData.success){
        setIsConfigSubmitted(true);
        setFeedbackMessage({
          type: 'success', 
          text: configData.message || 'Configuration successfull' 
        });
        fetchSessionStatus();
      }else{
        setFeedbackMessage({ 
          type: 'error', 
          text: configData.message || 'Something went wrong during configuration' });
      }

    } catch (error) {
      setFeedbackMessage({
        type: 'error', 
        text: 'An error occurred during configuration submission !'});
      console.error("Error during configuration submission:", error);
    }

    setTimeout(() => {
      setFeedbackMessage(null); // Clear feedback message after 2 seconds
    }, 2000);

  };
  

  const handleStartSession = async () => {
    try {
      const response = await startSimulation(); // Call start API
      if (!response.error) {
        setFeedbackMessage({
          type: 'success',
          text: response.message || 'Session started successfully!',
        });
        setIsResetSessionClicked(false);
        fetchSessionStatus(); // Refresh session status
      } else {
        setFeedbackMessage({
          type: 'error',
          text: response.message || 'Failed to start session. Please check configuration.',
        });
      }
    } catch (error) {
      setFeedbackMessage({
        type: 'error',
        text: 'An error occurred while starting the session.',
      });
      console.error(error);
    }

    setTimeout(() => {
      setFeedbackMessage(null); // Clear feedback message after 2 seconds
    }, 2000);
  };


  const handleStopSession = async () => {
    try {
      const response = await stopSimulation(); // Call stop API
      if (!response.error) {
        setFeedbackMessage({
          type: 'success',
          text: response.message || 'Session stopped successfully!',
        });
        fetchSessionStatus(); // Refresh session status
      } else {
        setFeedbackMessage({
          type: 'error',
          text: response.message || 'Failed to stop session',
        });
      }
    } catch (error) {
      setFeedbackMessage({
        type: 'error',
        text: 'An error occurred while stopping the session',
      });
      console.error(error);
    }

    setTimeout(() => {
      setFeedbackMessage(null); // Clear feedback message after 2 seconds
    }, 2000);

  };


  const handleResetSession = async () => {
    try {
      const response = await resetSimulation(); // Call reset API
      if (!response.error) {
        setFeedbackMessage({
          type: 'success',
          text: response.message || 'Session restarted successfully!',
        });
        setIsResetSessionClicked(true);
        fetchSessionStatus(); // Refresh session status
        fetchVendors();
      } else {
        setFeedbackMessage({
          type: 'error',
          text: response.message || 'Failed to restart session',
        });
      }
    } catch (error) {
      setFeedbackMessage({
        type: 'error',
        text: 'An error occurred while restarting the session',
      });;
      console.error(error);
    }

    setTimeout(() => {
      setFeedbackMessage(null); // Clear feedback message after 2 seconds
    }, 2000);

  };


  const fetchSessionStatus = async () => {
    const response = await getSessionStatus();
    if (!response.error) {
      setSessionStatus(response.data);
    } else {
      setFeedbackMessage({
        type: 'error',
        text: response.message || 'Failed to retrieve session data',
      });
    }
  };
  
  useEffect(() => {
    fetchSessionStatus();

    const intervalId = setInterval(() => {
      fetchSessionStatus();
    }, 2000);

    return() => clearInterval(intervalId);
  }, []); // Fetch session status when the component mounts


  //vendor view section
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendors, setVendors] = useState([]);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Handle vendor name input
  const handleVendorNameChange = (e) => {
    setVendorName(e.target.value);
  };

  // Handle vendor email input and validate in real-time
  const handleVendorEmailChange = (e) => {
    const email = e.target.value;
    setVendorEmail(email);
    setIsEmailValid(emailRegex.test(email)); // Check email validity
  };

  // Determine if the "Add Vendor" button should be enabled
  const isButtonDisabled = !(vendorName && vendorEmail && isEmailValid);


  //Fetch the vendor list on component load
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try{
      const response = await getAllVendors();
      if (!response.error) {
        setVendors(response.data);
      }else {
        setFeedbackMessage({
          type: 'error',
          text: response.message || 'Error occurred while adding vendor before session.',
        });
      }
    } catch (error) {
      console.error(error);
      setFeedbackMessage({
        type: 'error',
        text: 'Error occurred while adding vendor before session.',
      });

    }

    setTimeout(() => {
      setFeedbackMessage(null); // Clear feedback message after 2 seconds
    }, 2000);

  };

  const handleAddVendorBeforeStart = async () => {
    try{
      const response = await addVendorBeforeSession({ vendorName, vendorEmail});
      if(!response.error){
        setFeedbackMessage({
          type: 'success',
          text: response.message || 'Vendor added successfully!',
        });
        fetchVendors(); //Refresh vendor list
      }else {
        setFeedbackMessage({
          type: 'error',
          text: response.message || 'Failed to add vendor.',
        });
      }
    } catch (error) {
      console.error(error);
      setFeedbackMessage({
        type: 'error',
        text: 'Error occurred while adding vendor.',
      });
    }
  };


  const handleAddVendorDuringSession = async () => {
    try{
      const response = await addVendorDuringSession({ vendorName, vendorEmail});
      if(!response.error){
        setFeedbackMessage({
          type: 'success',
          text: response.message || 'Vendor added successfully!',
        });
        fetchVendors(); //Refresh vencor list
      }else {
        setFeedbackMessage({
          type: 'error',
          text: response.message || 'Failed to add vendor.',
        });
      }
    } catch (error) {
      console.error(error);
      setFeedbackMessage({
        type: 'error',
        text: 'Error occurred while adding vendor',
      });
    }
  };


  const handleAddVendor = async () => {
    // Check if session is running
    if (sessionStatus && sessionStatus.sessionStatus) {
      // Call the method to add vendor during session
      await handleAddVendorDuringSession();
    } else {
      // Call the method to add vendor before the session
      await handleAddVendorBeforeStart();
    }
    setTimeout(() => {
      setFeedbackMessage(null); // Clear feedback message after 2 seconds
    }, 2000);

    fetchVendors();
  };
  


  // WebSocket for receiving logs
  useEffect(() => {
  const webSocket = new WebSocketService('ws://localhost:8080/log');

  webSocket.onMessage((log) => {
  // Update logs when a new log is received
  setLogs((prevLogs) => [...prevLogs, log]);
  });

  return () => webSocket.closeConnection();}, []);
  // Scroll to the bottom of the log container
  const scrollToBottom = () => {
    const logContainer = document.getElementById('log-container');
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  };

  // Call scrollToBottom whenever the logs are updated
  useEffect(() => {
    scrollToBottom();
  }, [logs]);


  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
      </header>


      {/* Configuration Form */}
      <section className="config-section">
        <h2>System Configuration</h2>
          <form className="config-form">
            {/* Feedback Message */}
            {feedbackMessage && (
              <div className={`feedback-message ${feedbackMessage.type} show`}>
                {feedbackMessage.text}
              </div>
            )}

            <div className="form-group">
              <label>Maximum Tickets for Event</label>
                  <input
                    type="number"
                    value={ticketsConfig.maxCapacity}
                    onChange={(e) =>
                      handleConfigChange("maxCapacity", +e.target.value)
                    }
                  />
            </div>
                
            <div className="form-group">
              <label>Ticket Pool Limit</label>
                <input
                  type="number"
                  value={ticketsConfig.totalTickets}
                  onChange={(e) =>
                    handleConfigChange("totalTickets", +e.target.value)
                  }
                />
            </div>
      
            <div className="form-group">
              <label>Ticket Release Rate</label>
                <input
                  type="number"
                  value={ticketsConfig.releaseRate}
                  onChange={(e) =>
                    handleConfigChange("releaseRate", +e.target.value)
                  }
                />
            </div>
            
            <div className="form-group">
              <label>Ticket Retrieval Rate</label>
                <input
                  type="number"
                  value={ticketsConfig.retrievalRate}
                  onChange={(e) =>
                    handleConfigChange("retrievalRate", +e.target.value)
                  }
                />
            </div>
                
            {errorMessage && <div className="error-message">{errorMessage}</div>}

            <button type="button" className="submit-button" onClick={handleConfigSubmit} disabled={isSubmitConfigDisabled || !isValidConfigForm}>
              Submit Configuration
            </button>
          </form>
          
      </section>

      <section className='right-side'>

        {/* Session Control Panel */}
        <section className="control-panel">
          <h2>Control Panel</h2>
            <div className="control-buttons">
            {feedbackMessage && (
              <div className={`feedback-message ${feedbackMessage.type}`}>
                {feedbackMessage.text}
              </div>
            )}
              <button onClick={handleStartSession} disabled={sessionStatus === "running"|| !isConfigSubmitted}>Start</button>
              <button onClick={handleStopSession} disabled={sessionStatus === "stopped" || !isConfigSubmitted}>Stop</button>
              <button onClick={handleResetSession} disabled={isResetSessionClicked}>Reset Session</button>
            </div>

            {sessionStatus && (
            <p className={`session-status ${sessionStatus.sessionStatus ? "running" : "stopped"}`}>
            Session Status : {sessionStatus.sessionStatus ? "Running" : "Stopped"}
            </p>
          )}              
        </section>

        
        {/* Ticket Pool Status */}
        <section className="ticket-status">
          <h2>Ticket Pool Status</h2>
            {sessionStatus ? (
              <table>
                <thead>
                  <tr>
                    <th>Maximum Tickets</th>
                    <th>Released Tickets</th>
                    <th>Tickets Available</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{sessionStatus.maxTicketCapacity}</td>
                    <td>{sessionStatus.releasedTickets}</td>
                    <td>{sessionStatus.currentTickets}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
            <p>Loading ticket pool status...</p>
            )}
        </section>

      </section>

        
      {/* vendor Add Section */}
      <section className="add-vendor-section">
        <h2>Add Vendor</h2>
          <div className="form-group">
            <label htmlFor="vendor-name">Vendor Name</label>
            <input
              id="vendor-name"
              type="text"
              placeholder="Vendor Name"
              value={vendorName}
              onChange={handleVendorNameChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="vendor-email">Email</label>
            <input
              id="vendor-email"
              type="text"
              placeholder="Email"
              value={vendorEmail}
              onChange={handleVendorEmailChange}
            />
            {!isEmailValid && vendorEmail && (
              <span style={{ color: 'red' }}>Invalid email address</span>
            )}
          </div>

          <div className="button">
            <button className="add-vendor-button" onClick={handleAddVendor} disabled={isButtonDisabled}>Add Vendor</button>
          </div>

      </section>


      {/* Vendor View Section */}
      <section className="vendor-list-section">
        <h2>Vendor List</h2>
        <div className='table-wrapper'> 
        <table className="vendor-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length > 0 ? (
               vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td>{vendor.vendorId}</td>
                  <td>{vendor.vendorName}</td>
                  <td>{vendor.vendorEmail}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No vendors available</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </section>
     
      
      {/* Real-Time Logs */}
      <section className="log-display">
        <h2>Real-Time Log Display</h2>
        <div className="log-container" id="log-container">
          {logs.length > 0 ? (
            logs.map((log, index) => {
              // Split log by the first space: timestamp is before the first space, message is after
              const [timestamp, ...messageParts] = log.split(' ');
              const message = messageParts.join(' '); // Join back the message in case there are multiple spaces

              return (
                <div key={index} className="log-entry">
                  <div className="log-message">{message}</div>
                  <div className="log-timestamp">{timestamp}</div>
                </div>
              );
            })
          ) : (
            // Placeholder message or empty space for when no logs are available
            <div className="no-logs">No logs available yet.</div>
          )}
        </div>
      </section>

    </div>

  );

}

export default AdminDashboard;