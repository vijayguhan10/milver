import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import "../styles/customers.css";
import {
  FaUsers,
  FaStar,
  FaCheckCircle,
  FaFileExport,
  FaSearch,
  FaPlus,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customersData, setCustomersData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isviewmoreopen, setisviewmoreopen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isEventAdded, setIsEventAdded] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: "",
    address: "",
    latitude: "13.0473059",
    longitude: "80.2625205",
    location: {
      type: "Point",
      coordinates: ["80.2625205", "13.0473059"],
    },
    phone: "",
    deliverytime: "10.00",
    route_id: "1",
    route_name: "",
  });

  const handleDelete = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };
  const [formErrors, setFormErrors] = useState({
    name: "",
    address: "",
    phone: "",
    route_name: "",
  });
  const getCustomerData = async () => {
    try {
      console.log("consoled");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/customer/`
      );
      setCustomersData(response.data);
      console.log(response.data, "customerdata");
    } catch (error) {
      console.error("Error fetching customer data: ", error);
    }
  };

  useEffect(() => {
    getCustomerData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerForm({ ...customerForm, [name]: value });
  };
  const [showExportOptions, setShowExportOptions] = useState(false);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleExportCSV = () => {
    toast.info("Exporting as CSV...");
  };

  const handleExportPDF = () => {
    toast.info("Exporting as PDF...");
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const coordinates = await getCoordinates(customerForm.address);
    if (coordinates) {
      setCustomerForm((prevState) => ({
        ...prevState,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        location: {
          type: "Point",
          coordinates: [coordinates.longitude, coordinates.latitude], // GeoJSON format
        },
      }));
    } else {
      toast.error("Failed to fetch coordinates for the address.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/customer/`,
        {
          ...customerForm,
          location: {
            type: "Point",
            coordinates: [customerForm.longitude, customerForm.latitude],
          },
        }
      );
      console.log("Customer added:", response.data);
      await getCustomerData()
      toast.success("Customer added successfully!");
      setIsModalOpen(false);
      setCustomerForm({
        name: "",
        address: "",
        latitude: "13.0473059",
        longitude: "80.2625205",
        location: {
          type: "Point",
          coordinates: ["80.2625205", "13.0473059"],
        },
        phone: "",
        deliverytime: "10.00",
        route_id: "2",
        route_name: "",
      });
    } catch (error) {
      console.error("Error adding customer: ", error);
      if (error.response) {
        toast.error(
          `Error: ${
            error.response.data.message || "An unknown error occurred."
          }`
        );
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };
  const handleCloseDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
    setDeleteConfirmation("");
  };

  const getCoordinates = async (address) => {
    const accessToken =
      "pk.eyJ1Ijoic2FiYXJpbTYzNjkiLCJhIjoiY20zYWc2ZzdnMG5kZjJrc2F3eXUyczhiaiJ9.KluQuo4u7AMijmoli9HZmg";
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address
    )}.json?access_token=${accessToken}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].geometry.coordinates;
        return { latitude, longitude };
      } else {
        toast.error("No coordinates found for the specified address.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      toast.error("Error fetching coordinates.");
      return null;
    }
  };
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editCustomerForm, setEditCustomerForm] = useState({
    name: "",
    address: "",
    phone: "",
    route_name: "",
    latitude: "13.0473059",
    longitude: "80.2625205",
    location: {
      type: "Point",
      coordinates: ["80.2625205", "13.0473059"],
    },
    deliverytime: "10.00",
    route_id: "1",
  });

  const handleEditCustomer = () => {
    setEditCustomerForm({ ...selectedCustomer });
    setIsEditModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!customerForm.name) errors.name = "Name is required";
    if (!customerForm.address) errors.address = "Address is required";
    if (!customerForm.phone) errors.phone = "Phone is required";
    if (!customerForm.route_name) errors.route_name = "Route Name is required";
    return errors;
  };

  const setmodalclose = () => {
    setCustomerForm({
      name: "",
      address: "",
      location: {
        type: "Point",
        coordinates: ["80.2625205", "13.0473059"],
      },
      phone: "",
      deliverytime: "10.00",
      route_id: "1",
      route_name: "",
    });
    setIsModalOpen(false);
    setFormErrors({});
  };
  const handleViewMore = (customer) => {
    setSelectedCustomer(customer);
    setisviewmoreopen(true);
  };
  const closeModal = () => {
    setSelectedCustomer(null);
    setisviewmoreopen(false);
  };
  const handleSubmitEdit = async () => {
    const coordinates = await getCoordinates(editCustomerForm.address);
    if (coordinates) {
      setEditCustomerForm((prevState) => ({
        ...prevState,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        location: {
          type: "Point",
          coordinates: [coordinates.longitude, coordinates.latitude],
        },
      }));
    } else {
      toast.error("Failed to fetch coordinates for the address.");
      return;
    }

    const updatedCustomer = {
      id: selectedCustomer._id,
      name: editCustomerForm.name,
      address: editCustomerForm.address,
      phone: editCustomerForm.phone,
      route_name: editCustomerForm.route_name,
      deliverytime: editCustomerForm.deliverytime,
      location: {
        latitude: editCustomerForm.latitude,
        longitude: editCustomerForm.longitude,
      },
      route_id: selectedCustomer.route_id,
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/customer/`,
        updatedCustomer
      ); // Removed the customer ID from the URL
      console.log("Customer updated:", response.data);

      toast.success("Customer updated successfully!");
      setIsEditModalOpen(false);
      setIsEventAdded(true);
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Error updating customer.");
    }
  };

  return (
    <section className="customers">
      <Header />
      <div className="main-content">
        <div className="add-customer-container-right">
          <div className="total-customers-box">
            <span>Total Customers: {customersData.length}</span>
          </div>
          <div className="add-customer-options">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="export-btn-container">
              <button
                className="export-btn"
                onMouseEnter={() => setShowExportOptions(true)}
                onMouseLeave={() => setShowExportOptions(false)}
              >
                <FaFileExport className="export-icon" />
                Export
                {showExportOptions && (
                  <div className="export-dropdown">
                    <button onClick={handleExportCSV}>Export as CSV</button>
                    <button onClick={handleExportPDF}>Export as PDF</button>
                  </div>
                )}
              </button>
            </div>

            <button
              className="add-customer-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <FaPlus className="add-customer-icon" />
              <span className="add-customer-text">Add Customer</span>
            </button>
          </div>
        </div>
        <div className="table-container">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Customer ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Route Id</th>
                  <th>Route Name</th>
                </tr>
              </thead>
              <tbody>
                {customersData.length === 0 ? (
                  <tr>
                    <td colSpan="9">Loading customers...</td>
                  </tr>
                ) : (
                  customersData
                    .filter(
                      (customer) =>
                        (customer.name?.toLowerCase() || "").includes(
                          searchTerm.toLowerCase()
                        ) ||
                        (customer.phone || "").includes(searchTerm) ||
                        (customer.address?.toLowerCase() || "").includes(
                          searchTerm.toLowerCase()
                        ) ||
                        (customer.route_name?.toLowerCase() || "").includes(
                          searchTerm.toLowerCase()
                        )
                    )
                    .map((customer, index) => (
                      <tr key={customer._id}>
                        <td>{index + 1}</td>
                        <td>{customer.customer_id}</td>
                        <td>{customer.name || "N/A"}</td>
                        <td>{customer.phone || "N/A"}</td>
                        <td className="address-cell">{customer.address || "N/A"}</td> 
                        <td>{customer.route_id || "N/A"}</td>
                        <td>{customer.route_name || "N/A"}</td>

                        <td>
                          <button
                            className="viewmore"
                            onClick={() => handleViewMore(customer)}
                          >
                            View More
                          </button>
                        </td>
                      </tr>
                    ))
                )}

                {customersData.filter(
                  (customer) =>
                    customer.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    customer.phone.includes(searchTerm) ||
                    customer.address
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    customer.route_name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                ).length === 0 &&
                  searchTerm && (
                    <tr>
                      <td colSpan="9">
                        No customers found matching the search term.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Popup modal for customer creation */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setmodalclose()}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setmodalclose()}>
              ×
            </button>
            <h2>Add New Customer</h2>

            <input
              type="text"
              name="name"
              placeholder="Name"
              value={customerForm.name}
              onChange={handleInputChange}
              className={formErrors.name ? "input-error" : ""}
            />
            {formErrors.name && (
              <span className="error-message">{formErrors.name}</span>
            )}

            <input
              type="text"
              name="address"
              placeholder="Address"
              value={customerForm.address}
              onChange={handleInputChange}
              className={formErrors.address ? "input-error" : ""}
            />
            {formErrors.address && (
              <span className="error-message">{formErrors.address}</span>
            )}

            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={customerForm.phone}
              onChange={handleInputChange}
              className={formErrors.phone ? "input-error" : ""}
            />
            {formErrors.phone && (
              <span className="error-message">{formErrors.phone}</span>
            )}

            <input
              type="text"
              name="route_name"
              placeholder="Route Name"
              value={customerForm.route_name}
              onChange={handleInputChange}
              className={formErrors.route_name ? "input-error" : ""}
            />
            {formErrors.route_name && (
              <span className="error-message">{formErrors.route_name}</span>
            )}

            <button className="modal-submit" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      )}

      {isviewmoreopen && selectedCustomer && (
        <div className="customer-popup-overlay" onClick={closeModal}>
          <div
            className="customer-popup-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="customer-popup-close" onClick={closeModal}>
              ×
            </button>
            <h2 className="customer-popup-title">Customer Details</h2>
            <div className="customer-popup-details">
              <div className="customer-detail-item">
                <strong>Customer ID:</strong>{" "}
                {selectedCustomer.customer_id || "N/A"}
              </div>
              <div className="customer-detail-item">
                <strong>Name:</strong> {selectedCustomer.name || "N/A"}
              </div>
              <div className="customer-detail-item">
                <strong>Phone:</strong> {selectedCustomer.phone || "N/A"}
              </div>
              <div className="customer-detail-item">
                <strong>Address:</strong> {selectedCustomer.address || "N/A"}
              </div>
              <div className="customer-detail-item">
                <strong>Route ID:</strong> {selectedCustomer.route_id || "N/A"}
              </div>
              <div className="customer-detail-item">
                <strong>Route Name:</strong>{" "}
                {selectedCustomer.route_name || "N/A"}
              </div>
              <div className="customer-detail-item">
                <strong>Status:</strong> {selectedCustomer.status || "N/A"}
              </div>
            </div>
            <div className="customer-popup-actions">
              <button
                className="customer-popup-edit-btn"
                onClick={handleEditCustomer}
              >
                Edit
              </button>
              <button
                className="customer-popup-delete-btn"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
            <button className="customer-popup-close-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
      {isEditModalOpen && (
        <div
          className="edit-modal-overlay"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="edit-modal-close-btn"
              onClick={() => setIsEditModalOpen(false)}
            >
              ×
            </button>
            <h2 className="edit-modal-title">Edit Customer</h2>
            <div className="edit-modal-form">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={editCustomerForm.name}
                onChange={(e) =>
                  setEditCustomerForm({
                    ...editCustomerForm,
                    name: e.target.value,
                  })
                }
                className="edit-modal-input"
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={editCustomerForm.address}
                onChange={(e) =>
                  setEditCustomerForm({
                    ...editCustomerForm,
                    address: e.target.value,
                  })
                }
                className="edit-modal-input"
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={editCustomerForm.phone}
                onChange={(e) =>
                  setEditCustomerForm({
                    ...editCustomerForm,
                    phone: e.target.value,
                  })
                }
                className="edit-modal-input"
              />
              <input
                type="text"
                name="route_name"
                placeholder="Route Name"
                value={editCustomerForm.route_name}
                onChange={(e) =>
                  setEditCustomerForm({
                    ...editCustomerForm,
                    route_name: e.target.value,
                  })
                }
                className="edit-modal-input"
              />
              {/* Add other fields as necessary */}

              <button
                className="edit-modal-submit-btn"
                onClick={handleSubmitEdit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </section>
  );
};

export default Customers;
