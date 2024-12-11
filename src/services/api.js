// src/services/api.js (or wherever you make API calls)
const API_BASE_URL = "http://localhost:8080/api"; // Backend URL

const login = async (credentials) => {
  const response = await fetch('http://localhost:8080/api/admin/login', {
    method: "POST",
    body: JSON.stringify(credentials),
    headers: {
      "Content-Type": "application/json",
    },
    
  });
  const data = await response.json();
  return data;
};

export {login};


const submitConfig = async (configurationParameters) => {
    try {
        const response = await fetch(`${API_BASE_URL}/configure`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configurationParameters),
      });

      const result = await response.json();
      const {message, data, error} = result;
      
      if (error) {
        return { success: false, message }; // If error is true, we throw an error with the message.
      }

      return { success: true, message, data }; 

    } catch (error) {
      console.error("Error in submitConfig:", error);
      throw error; // Rethrow error to be caught in AdminView.js
    }
  };

  export {submitConfig};


  // Start the simulation
const startSimulation = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/simulation/start`, {
      method: "POST",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error starting simulation:", error);
    return { error: true, message: "Failed to start simulation" };
  }
};

export {startSimulation};


// Stop the simulation
const stopSimulation = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/simulation/stop`, {
      method: "POST",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error stopping simulation:", error);
    return { error: true, message: "Failed to stop simulation" };
  }
};

export {stopSimulation};


// Restart the simulation
const resetSimulation = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/simulation/reset`, {
      method: "POST",
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error restarting simulation:", error);
    return { error: true, message: "Failed to restart simulation" };
  }
};

export {resetSimulation};


// Get session status
const getSessionStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/session/data`, {
      method: "GET",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching session status:", error);
    return { error: true, message: "Failed to retrieve session status" };
  }
};

export {getSessionStatus};


const addCustomerBeforeSession = async (customerData) => {
  const response = await fetch(`${API_BASE_URL}/customer/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData),
  });
  return await response.json();
};

export {addCustomerBeforeSession};


const addCustomerDuringSession = async (customerData) => {
  const response = await fetch(`${API_BASE_URL}/customer/add-customer-during-the-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData),
  });
  return await response.json();

};

export {addCustomerDuringSession}


const getAllCustomers = async () => {

  const response = await fetch(`${API_BASE_URL}/customer/list`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return await response.json();
};

export {getAllCustomers}


const addVendorBeforeSession = async (vendorData) => {
  const response = await fetch(`${API_BASE_URL}/vendor/add`, {
    method: 'POST',
    headers: { 'Content-Type' : 'application/json'},
    body: JSON.stringify(vendorData),
  });
  return await response.json();
};

export {addVendorBeforeSession}


const addVendorDuringSession = async (vendorData) => {
  const response = await fetch(`${API_BASE_URL}/vendor/add-vendor-during-the-session`, {
    method: 'POST',
    headers: { 'Content-Type' : 'application/json'},
    body: JSON.stringify(vendorData),
  });
  return await response.json();
};

export {addVendorDuringSession}


const getAllVendors = async () => {
  
  const response = await fetch(`${API_BASE_URL}/vendor/list`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return await response.json();
};

export {getAllVendors}