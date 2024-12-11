import React, { useState, useEffect } from 'react';
import { getAllVendors, getSessionStatus, addCustomerBeforeSession, addCustomerDuringSession, getAllCustomers } from '../services/api';
import WebSocketService from '../services/webSocketService';

function CustomerDashboard() {

  const [sessionStatus, setSessionStatus] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [name, setName] = useState('');
  const [ticketsToPurchase, setTicketsToPurchase] = useState('');
  const [isTicketsValid, setIsTicketsValid] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  
  // Handle vendor name input
  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  // Handle vendor email input and validate in real-time
  const handleTicketCountChange = (e) => {
    const integer = e.target.value;
    setTicketsToPurchase(integer);
    setIsTicketsValid(Number(integer) > 0 && Number.isInteger(Number(integer))); // Check if it's a positive integer
};


  // Determine if the "Add Vendor" button should be enabled
  const isButtonDisabled = !(name && ticketsToPurchase && isTicketsValid);


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


  useEffect(() => {
    fetchVendors(); // Call this function when the component mounts

    const intervalId = setInterval(() => {
      fetchSessionStatus();
    }, 10000);

    return() => clearInterval(intervalId);
  }, []);
  
  const fetchVendors = async () => {
    try {
      const response = await getAllVendors();
      if (!response.error) {
        setVendors(response.data); // Set the vendor list
      } else {
        setFeedbackMessage({
          type: 'error',
          text: response.message || 'Failed to retrieve vendor list',
        });
      }
    } catch (error) {
      console.error(error);
      setFeedbackMessage({
        type: 'error',
        text: 'Error occured during vendor list retrieving.',
      });
    }
  };

  
  // Fetch the customer list on component load
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await getAllCustomers();
      if (!response.error) {
        setCustomers(response.data);
      } else {
        setFeedbackMessage({
          type: 'error',
          text: response.message || 'Failed to retrieve customer list',
        });
      }
    } catch (error) {
      console.error(error);
      setFeedbackMessage({
        type: 'error',
        text: 'Error occured during customer list retrieving.',
      });
    }
  };

  const handleAddCustomerBeforeStart = async () => {
    try {
      const response = await addCustomerBeforeSession({ name, ticketsToPurchase: parseInt(ticketsToPurchase) });
      if (!response.error) {
        setFeedbackMessage({
          type: 'success',
          text: response.message || 'Customer added successfully!',
        });
        fetchCustomers(); // Refresh customer list
      } else {
        setFeedbackMessage({
          type: 'error',
          text: response.message || 'Failed to retrieve customer list',
        });
      }
    } catch (error) {
      console.error(error);
      setFeedbackMessage({
        type: 'error',
        text: 'Error occured during customer list retrieving.',
      });
    }
  };

  const handleAddCustomerDuringSession = async () => {
    try {
      const response = await addCustomerDuringSession({ name, ticketsToPurchase: parseInt(ticketsToPurchase) });
      if (!response.error) {
        setFeedbackMessage({
          type: 'success',
          text: response.message || 'Customer added successfully!',
        });
        fetchCustomers(); // Refresh customer list
      } else {
        setFeedbackMessage({
          type: 'error',
          text: response.message || 'Failed to add customer',
        });
      }
    } catch (error) {
      console.error(error);
      setFeedbackMessage({
        type: 'error',
        text: 'Error occured during customer add',
      });
    }
  };

  const handleAddCustomer = async () => {
    // Check if session is running
    if (sessionStatus && sessionStatus.sessionStatus) {
      // Call the method to add vendor during session
      await handleAddCustomerDuringSession();
      fetchCustomers();
    } else {
      // Call the method to add vendor before the session
      await handleAddCustomerBeforeStart();
      fetchCustomers();
    }

    setTimeout(() => {
      setFeedbackMessage(null); // Clear feedback message after 2 seconds
    }, 2000);

  };

  
  //log display section
  const [logs, setLogs] = useState([]);

  // WebSocket for receiving logs
  useEffect(() => {
    const webSocket = new WebSocketService('ws://localhost:8080/log');

    webSocket.onMessage((log) => {
      // Update logs when a new log is received
      setLogs((prevLogs) => [...prevLogs, log]);
    });

    return () => webSocket.closeConnection();
  }, []);

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


    
  return(

    <div className='customer-dashboard'>
      {/* Feedback Message */}
      {feedbackMessage && (
              <div className={`feedback-message ${feedbackMessage.type} show`}>
                {feedbackMessage.text}
              </div>
            )}
      <header className='dashboard-header'>
        <h1>Customer Dashboard</h1>
      </header>
      

      {/* Ticket Pool Status */}
      <section className="customer-ticket-status">
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
        {sessionStatus && (
          <p className={`customer-session-status ${sessionStatus.sessionStatus ? "running" : "stopped"}`}>
            Session Status: {sessionStatus.sessionStatus ? "Running" : "Stopped"}
          </p>
        )}
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


      {/* Customer Add Section */}
      <div className="add-customer-section">
        <h2>Add Customer</h2>
        <div className="form-group">
          <label htmlFor="customer-name">Customer Name</label>
          <input
            id="customer-name"
            type="text"
            placeholder="Customer Name"
            value={name}
            onChange={handleNameChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="tickets-to-purchase">Number of Tickets per attempt</label>
          <input
            id="tickets-to-purchase"
            type="number"
            placeholder="Number of Tickets"
            value={ticketsToPurchase}
            onChange={handleTicketCountChange}
          />
          {!isTicketsValid && ticketsToPurchase && (
              <span style={{ color: 'red' }}>Invalid ticket count !</span>
            )}
        </div>

        <div className="button">
          <button className="add-customer-button" onClick={handleAddCustomer} disabled={isButtonDisabled}>Add Customer</button>
        </div>
      </div>


      {/* Customer View Section */}
      <div className="customer-list-section">
        <h2>Customer List</h2>
        <div className='table-wrapper'> 
        <table className="customer-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Tickets to Purchase</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.ticketsToPurchase}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No customers available</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>


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
};

export default CustomerDashboard;
