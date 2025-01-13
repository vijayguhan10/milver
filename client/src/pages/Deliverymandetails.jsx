import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import deliveryman from "../assets/deliveryman.jpg";
import "../styles/deliverymandetails.css";
import {
  FaUsers,
  FaStar,
  FaCheckCircle,
  FaFileExport,
  FaSearch,
  FaPlus,
} from "react-icons/fa";
import axios from "axios";
import { MdClose } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CSVLink } from "react-csv";
import { jsPDF } from "jspdf";
import { useRef } from "react";
import calender from "../assets/calendar.png";
import DeliveryManImg from "../assets/delivery-man.png";

function Deliverymandetails() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [routeFilter, setRouteFilter] = useState("Routes");
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deliverymendata, setdelivermendata] = useState([]);
  const [isEventAdded, setIsEventAdded] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    phone: "",
    address: "",
    primaryRouteName: "",
    status: "",
  });
  const handleShowDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
  };

  const handleCloseDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
    setDeleteConfirmation("");
  };

  const handleDeleteConfirmationChange = (e) => {
    setDeleteConfirmation(e.target.value);
  };

  const handleDelete = async () => {
    try {
      console.log("Attempting to delete deliveryman...");
      if (deleteConfirmation === selectedEmployee.name) {
        console.log("Selected employee ID:", selectedEmployee._id);

        const response = await axios.delete(
          `${import.meta.env.VITE_API_URL}/deliverymen/`,
          {
            data: { id: selectedEmployee._id },
          }
        );

        console.log("Employee deleted:", selectedEmployee.name);
        toast.success(
          response.data.message || "Deliveryman deleted successfully"
        );

        handleCloseDeleteConfirmation();
        setIsEventAdded((prev) => !prev);
      } else {
        alert("Name does not match for deletion.");
      }
    } catch (error) {
      console.error(
        "Error deleting deliveryman:",
        error.response?.data || error.message
      );
      toast.error("Failed to delete deliveryman record");
    }
  };

  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    routes: [],
    category: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    address: "",
    phone: "",
    route_name: "",
  });
  const getDeliverymenData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/deliverymen/`
      );
      console.log(response.data);

      setdelivermendata(response.data);
    } catch (error) {
      console.error("Error fetching deliverymen data: ", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted) {
        await getDeliverymenData();
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [isEventAdded]);

  const handleAddEmployee = async () => {
    const errors = {};
    if (!customerForm.name) errors.name = "Name is required.";
    if (!customerForm.phone) errors.phone = "Phone number is required.";
    if (!customerForm.email) errors.email = "Email is required.";
    if (!customerForm.address) errors.address = "Address is required.";
    if (!customerForm.routes || customerForm.routes.length === 0)
      errors.routes = "At least one route must be selected.";
    if (!customerForm.category) errors.category = "Category is required.";

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/deliverymen/`,
        customerForm
      );
      toast.success("Employee added successfully!");
      setIsAddEmployeeModalOpen(false);
      setIsEventAdded((prev) => !prev);
    } catch (error) {
      console.error(
        "Error adding employee:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || "Failed to add employee.");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleRouteChange = (e) => {
    setRouteFilter(e.target.value);
  };

  const filteredEmployees = deliverymendata.filter((employee) => {
    // Match search term (case-insensitive)
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.primaryRouteName &&
        employee.primaryRouteName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    // Match status filter
    const matchesStatus =
      statusFilter === "All" || // Show all employees if 'All' is selected
      employee.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };
  const csvLinkRef = useRef();
  const handleExportCSV = () => {
    console.log("Exporting as CSV...");
    toast.info("CSV Export Started!");

    const headers = [
      { label: "Name", key: "name" },
      { label: "Email", key: "email" },
      { label: "Phone", key: "phone" },
      { label: "Status", key: "status" },
    ];

    return (
      <CSVLink
        data={deliverymendata}
        headers={headers}
        filename={"employee_data.csv"}
      >
        <button>Download CSV</button>
      </CSVLink>
    );
  };
  const handleExportPDF = () => {
    console.log(deliverymendata, "Exporting data to PDF");

    toast.info("PDF Export Started!");

    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Employee Data", 20, 20);

    let yPosition = 30;
    const marginBottom = 20;

    deliverymendata.forEach((item) => {
      if (yPosition + 60 > doc.internal.pageSize.height - marginBottom) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`Name: ${item.name}`, 20, yPosition);
      yPosition += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      doc.text(`Email: ${item.email}`, 20, yPosition);
      yPosition += 10;

      doc.text(`Phone: ${item.phone}`, 20, yPosition);
      yPosition += 10;

      doc.text(`Status: ${item.status}`, 20, yPosition);
      yPosition += 10;

      doc.text(`Address: ${item.address}`, 20, yPosition);
      yPosition += 15;

      doc.text(`Category: ${item.category}`, 20, yPosition);
      yPosition += 10;

      if (item.routes && item.routes.length > 0) {
        doc.text("Routes: ", 20, yPosition);
        item.routes.forEach((route, idx) => {
          yPosition += 10;
          doc.text(`${idx + 1}. ${route}`, 30, yPosition);
        });
      }
      yPosition += 15;

      if (!item.delivery_history.length && !item.fuel_allowance.length) {
        doc.text(
          "No delivery history or fuel allowance available.",
          20,
          yPosition
        );
        yPosition += 10;
      }

      yPosition += 20;
    });

    console.log("Exporting PDF complete");

    doc.save("employee_data.pdf");
  };
  const handleAttendanceChange = async (employee, empid) => {
    try {
      const choice = employee === "Present" ? true : false;
      const payload = { driver_id: empid, is_present: choice };
      console.log("Payload being sent:", payload);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/deliverymen/attendence`,
        payload
      );

      console.log("API Response:", response.data);

      if (response.status === 200) {
        toast.success("Attendance updated successfully");
        await getDeliverymenData();
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  const handleEdit = () => {
    if (selectedEmployee) {
      setEditForm({
        id: selectedEmployee._id,
        name: selectedEmployee.name,
        phone: selectedEmployee.phone,
        address: selectedEmployee.address,
        primaryRouteName: selectedEmployee.primaryRouteName,
        status: selectedEmployee.status,
      });

      setIsEditModalOpen(true);
    }
  };
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/deliverymen/`,
        {
          id: editForm.id,
          name: editForm.name,
          phone: editForm.phone,
          address: editForm.address,
          primaryRouteName: editForm.primaryRouteName,
          status: editForm.status,
        }
      );
      toast.success("Deliveryman details updated successfully");

      setSelectedEmployee({
        ...selectedEmployee,
        ...editForm,
      });

      setIsEventAdded((prev) => !prev);

      setIsEditModalOpen(false);
      setShowModal(true);
    } catch (error) {
      console.error("Error updating deliveryman:", error);
      toast.error("Failed to update deliveryman details");
    }
  };

  return (
    <section className="deliverymandetails">
      <Header />
      <div className="main-content">
        <div className="header-section">
          <h1 className="gradient-text">Employees</h1>

          <div className="header-buttons">
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
              onClick={() => setIsAddEmployeeModalOpen(true)}
            >
              <FaPlus className="add-customer-icon" />
              <span className="add-customer-text">Add Employee</span>
            </button>
          </div>
        </div>
        <div className="filter-bar">
          <div className="search-barmain">
            <FaSearch className="search-iconmain" />
            <input
              type="text"
              placeholder="Search Employees..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="status-filter-container">
            <select
              className="status-dropdown"
              value={statusFilter}
              onChange={handleStatusChange}
            >
              <option value="All">All</option>
              <option value="Available">Available</option>
              <option value="Assigned">Assigned</option>
              <option value="on_leave">Absent</option>
            </select>
          </div>
        </div>

        <div className="employee-list">
          {filteredEmployees.map((employee, index) => {
            // Ensure attendance is an array and presentCount calculation is correct
            const presentCount = Array.isArray(employee.attendence)
              ? employee.attendence.filter(
                  (att) => att.status.toLowerCase() === "present"
                ).length
              : 0;

            return (
              <div key={index} className="employee-card">
                <div
                  className={`employee-status ${
                    employee.status === "assigned"
                      ? "Assigned"
                      : employee.status === "available"
                      ? "Available"
                      : employee.status === "on_leave"
                      ? "Absent"
                      : ""
                  }`}
                >
                  {employee.status === "on_leave"
                    ? "Absent"
                    : employee.status.charAt(0).toUpperCase() +
                      employee.status.slice(1).toLowerCase()}
                </div>

                <div className="attendance-dropdown">
                  <button className="attendance-icon">
                    <img
                      src={calender}
                      alt="Calendar"
                      style={{
                        width: "28px",
                        height: "28px",
                        objectFit: "contain",
                      }}
                    />
                  </button>
                  <div className="dropdown-menu">
                    <button
                      onClick={() =>
                        handleAttendanceChange("Present", employee._id)
                      }
                      style={{
                        padding: "12px 20px",
                        fontSize: "0.8em",
                        fontWeight: "bold",
                      }}
                    >
                      Present
                    </button>
                    <button
                      onClick={() =>
                        handleAttendanceChange("Absent", employee._id)
                      }
                      style={{
                        padding: "12px 20px",
                        fontSize: "0.8em",
                        fontWeight: "bold",
                      }}
                    >
                      Absent
                    </button>
                  </div>
                </div>

                <div className="employee-info">
                  <img
                    src={DeliveryManImg}
                    alt="Employee"
                    className="employee-avatar"
                  />
                  <h3>{employee.name}</h3>
                  <div className="employee-details">
                    <p>
                      <strong>Route IDs:</strong>{" "}
                      {employee.routes?.length
                        ? employee.routes.map((route) => route.id).join(", ")
                        : "No routes assigned"}
                    </p>
                    <p>
                      <strong>Ph-no:</strong> {employee.phone} 📱
                    </p>
                    <p>
                      <strong>Type:</strong> {employee.category} ⏰
                    </p>
                    <p>
                      <strong>Attendance:</strong> {presentCount} Present
                    </p>
                  </div>
                  <p className="employee-joined">
                    <a href="#" onClick={() => handleViewDetails(employee)}>
                      View More
                    </a>
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {showModal && selectedEmployee && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h3 className="modal-title">{selectedEmployee.name}</h3>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Phone:</strong> {selectedEmployee.phone}
                </p>
                <p>
                  <strong>Email:</strong> {selectedEmployee.email}
                </p>
                <p>
                  <strong>Address:</strong> {selectedEmployee.address}
                </p>

                <p>
                  <strong>Status:</strong> {selectedEmployee.status}
                </p>

                <p>
                  <strong>Route IDs:</strong>{" "}
                  {selectedEmployee.routes && selectedEmployee.routes.length > 0
                    ? selectedEmployee.routes
                        .map((route) => route.id)
                        .join(", ")
                    : "No routes assigned"}
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn-edit" onClick={handleEdit}>
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={handleShowDeleteConfirmation}
                >
                  Delete
                </button>
                <button className="btn-close" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirmation && selectedEmployee && (
          <div className="delete-backdrop">
            <div className="delete-modal">
              <div className="delete-header">
                <h3>Are you sure you want to delete this employee?</h3>
              </div>
              <div className="delete-body">
                <p>
                  To confirm, type the name{" "}
                  <strong>{selectedEmployee.name}</strong> below:
                </p>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={handleDeleteConfirmationChange}
                  placeholder="Enter name to confirm"
                  className="delete-input"
                />
              </div>
              <div className="delete-footer">
                <button
                  className="delete-cancel-btn"
                  onClick={handleCloseDeleteConfirmation}
                >
                  Cancel
                </button>
                <button
                  className="delete-confirm-btn"
                  onClick={handleDelete}
                  disabled={deleteConfirmation !== selectedEmployee.name}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {isAddEmployeeModalOpen && (
          <div
            className="add-employee-modal-overlay"
            onClick={() => setIsAddEmployeeModalOpen(false)}
          >
            <div
              className="add-employee-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="add-employee-modal-header">
                <h2 className="add-employee-title">Add Employee</h2>
                <button
                  className="add-employee-close-btn"
                  onClick={() => setIsAddEmployeeModalOpen(false)}
                >
                  <MdClose />
                </button>
              </div>
              <div className="add-employee-modal-body">
                <input
                  type="text"
                  name="name"
                  placeholder="Employee Name"
                  value={customerForm.name}
                  onChange={(e) =>
                    setCustomerForm({ ...customerForm, name: e.target.value })
                  }
                  className={`add-employee-input ${
                    formErrors.name ? "input-error" : ""
                  }`}
                />
                {formErrors.name && (
                  <span className="error-message">{formErrors.name}</span>
                )}

                <input
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  value={customerForm.phone}
                  onChange={(e) =>
                    setCustomerForm({ ...customerForm, phone: e.target.value })
                  }
                  className={`add-employee-input ${
                    formErrors.phone ? "input-error" : ""
                  }`}
                />
                {formErrors.phone && (
                  <span className="error-message">{formErrors.phone}</span>
                )}

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={customerForm.email}
                  onChange={(e) =>
                    setCustomerForm({ ...customerForm, email: e.target.value })
                  }
                  className={`add-employee-input ${
                    formErrors.email ? "input-error" : ""
                  }`}
                />
                {formErrors.email && (
                  <span className="error-message">{formErrors.email}</span>
                )}

                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={customerForm.address}
                  onChange={(e) =>
                    setCustomerForm({
                      ...customerForm,
                      address: e.target.value,
                    })
                  }
                  className={`add-employee-input ${
                    formErrors.address ? "input-error" : ""
                  }`}
                />
                {formErrors.address && (
                  <span className="error-message">{formErrors.address}</span>
                )}

                <select
                  name="routes"
                  multiple
                  value={customerForm.routes}
                  onChange={(e) =>
                    setCustomerForm({
                      ...customerForm,
                      routes: Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      ),
                    })
                  }
                  className="add-employee-select"
                >
                  <option value="1">Route 1</option>
                  <option value="2">Route 2</option>
                  <option value="3">Route 3</option>
                </select>

                <select
                  name="category"
                  value={customerForm.category}
                  onChange={(e) =>
                    setCustomerForm({
                      ...customerForm,
                      category: e.target.value,
                    })
                  }
                  className="add-employee-select"
                >
                  <option value="">Select Category</option>
                  <option value="main_driver">Driver</option>
                  <option value="backup_driver">Backup Driver</option>
                </select>
              </div>
              <div className="add-employee-modal-footer">
                <button
                  className="add-employee-submit-btn"
                  onClick={handleAddEmployee}
                >
                  Add Employee
                </button>
                <button
                  className="add-employee-cancel-btn"
                  onClick={() => setIsAddEmployeeModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isEditModalOpen && (
          <div className="edit-modal-overlay">
            <div className="edit-modal">
              <div className="edit-modal-header">
                <h2 className="edit-modal-title">Edit Employee Details</h2>
                <button
                  className="edit-modal-close"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <MdClose />
                </button>
              </div>
              <div className="edit-modal-body">
                <form>
                  <div className="edit-form-group">
                    <label htmlFor="employeeName">Employee Name</label>
                    <input
                      id="employeeName"
                      type="text"
                      name="name"
                      placeholder="Enter Employee Name"
                      value={editForm.name}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="edit-form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      type="text"
                      name="phone"
                      placeholder="Enter Phone Number"
                      value={editForm.phone}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="edit-form-group">
                    <label htmlFor="address">Address</label>
                    <input
                      id="address"
                      type="text"
                      name="address"
                      placeholder="Enter Address"
                      value={editForm.address}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="edit-form-group">
                    <label htmlFor="primaryRouteName">Primary Route</label>
                    <input
                      id="primaryRouteName"
                      type="text"
                      name="primaryRouteName"
                      placeholder="Enter Primary Route"
                      value={editForm.primaryRouteName}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="edit-form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={editForm.status}
                      onChange={handleEditFormChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </form>
              </div>
              <div className="edit-modal-footer">
                <button
                  className="edit-button edit-button-save"
                  onClick={handleSaveEdit}
                >
                  Save
                </button>
                <button
                  className="edit-button edit-button-cancel"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer />
      </div>
    </section>
  );
}

export default Deliverymandetails;
