
// STEP 1: Select HTML elements


// =====================================
// 1. SELECT HTML ELEMENTS
// =====================================

const addJobBtn = document.getElementById("add-job-btn");
const formSection = document.getElementById("form-section");
const jobForm = document.getElementById("job-form");
const cancelBtn = document.getElementById("cancel-btn");
const applicationList = document.getElementById("application-list");

const totalApplications = document.getElementById("total-applications");
const totalInterviews = document.getElementById("total-interviews");
const totalOffers = document.getElementById("total-offers");
const totalRejected = document.getElementById("total-rejected");

const searchInput = document.getElementById("search-input");
const filterStatus = document.getElementById("filter-status");


// =====================================
// 2. LOAD SAVED APPLICATIONS
// =====================================

let applications = JSON.parse(
    localStorage.getItem("applications")
) || [];

let editingId = null;


// =====================================
// 3. CREATE NOTIFICATION ELEMENT
// =====================================

const notification = document.createElement("div");

notification.id = "notification";
notification.setAttribute("role", "status");
notification.setAttribute("aria-live", "polite");

document.body.appendChild(notification);


// Show notification

function showNotification(message, type = "success") {

    notification.textContent = message;
    notification.className = `notification ${type}`;

    notification.classList.add("show");

    clearTimeout(notification.timeoutId);

    notification.timeoutId = setTimeout(function () {
        notification.classList.remove("show");
    }, 3000);

}


// =====================================
// 4. CREATE JOB SEARCH SUMMARY
// =====================================

const summarySection = document.createElement("section");

summarySection.id = "job-summary";
summarySection.className = "job-summary";

const statsContainer = document.querySelector(".stats-container");

statsContainer.insertAdjacentElement("afterend", summarySection);


function updateSummary() {

    const total = applications.length;

    const interviews = applications.filter(
        app => app.status === "Interview"
    ).length;

    const offers = applications.filter(
        app => app.status === "Offered"
    ).length;

    const rejected = applications.filter(
        app => app.status === "Rejected"
    ).length;

    const active = applications.filter(
        app => app.status === "Applied"
    ).length;

    if (total === 0) {

        summarySection.textContent =
            "Your job search journey starts here. Add your first application to begin tracking your progress.";

        return;
    }

    summarySection.textContent =
        `You have ${total} application${total === 1 ? "" : "s"}: ` +
        `${active} awaiting a response, ${interviews} interview${interviews === 1 ? "" : "s"}, ` +
        `${offers} offer${offers === 1 ? "" : "s"} and ${rejected} rejection${rejected === 1 ? "" : "s"}.`;

}


// =====================================
// 5. OPEN APPLICATION FORM
// =====================================

addJobBtn.addEventListener("click", function () {

    editingId = null;

    jobForm.reset();

    formSection.hidden = false;

    jobForm.querySelector('button[type="submit"]').textContent =
        "Save Application";

});


// =====================================
// 6. CANCEL FORM
// =====================================

cancelBtn.addEventListener("click", function () {

    formSection.hidden = true;

    jobForm.reset();

    editingId = null;

    jobForm.querySelector('button[type="submit"]').textContent =
        "Save Application";

});


// =====================================
// 7. ADD OR UPDATE APPLICATION
// =====================================

jobForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const company = document.getElementById("company").value.trim();
    const position = document.getElementById("position").value.trim();
    const date = document.getElementById("date").value;
    const status = document.getElementById("status").value;

    if (!company || !position || !date) {
        showNotification("Please complete all required fields.", "error");
        return;
    }

    if (editingId !== null) {

        applications = applications.map(function (app) {

            if (app.id === editingId) {

                return {
                    ...app,
                    company: company,
                    position: position,
                    date: date,
                    status: status
                };

            }

            return app;

        });

        editingId = null;

        showNotification("Application updated successfully!");

    } else {

        const application = {
            id: Date.now(),
            company: company,
            position: position,
            date: date,
            status: status
        };

        applications.push(application);

        showNotification("Application added successfully!");

    }

    saveApplications();

    displayApplications();

    updateStatistics();

    updateSummary();

    jobForm.reset();

    formSection.hidden = true;

    jobForm.querySelector('button[type="submit"]').textContent =
        "Save Application";

    searchInput.value = "";
    filterStatus.value = "All";

});


// =====================================
// 8. SAVE APPLICATIONS
// =====================================

function saveApplications() {

    localStorage.setItem(
        "applications",
        JSON.stringify(applications)
    );

}


// =====================================
// 9. DISPLAY APPLICATIONS
// =====================================

function displayApplications(filteredApplications = applications) {

    applicationList.innerHTML = "";

    if (filteredApplications.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.className = "empty-message";

        if (applications.length === 0) {

            cell.textContent =
                "No applications yet. Click + Add Application to get started!";

        } else {

            cell.textContent =
                "No applications found. Try changing your search or filter.";

        }

        row.appendChild(cell);
        applicationList.appendChild(row);

        return;

    }

    filteredApplications.forEach(function (application) {

        const row = document.createElement("tr");

        const companyCell = document.createElement("td");
        companyCell.textContent = application.company;

        const positionCell = document.createElement("td");
        positionCell.textContent = application.position;

        const dateCell = document.createElement("td");
        dateCell.textContent = application.date;

        const statusCell = document.createElement("td");

        const statusBadge = document.createElement("span");

        statusBadge.className =
            `status-badge ${application.status.toLowerCase()}`;

        statusBadge.textContent = application.status;

        statusCell.appendChild(statusBadge);

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");

        editButton.className = "edit-btn";
        editButton.dataset.id = application.id;
        editButton.textContent = "Edit";

        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-btn";
        deleteButton.dataset.id = application.id;
        deleteButton.textContent = "Delete";

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);

        row.appendChild(companyCell);
        row.appendChild(positionCell);
        row.appendChild(dateCell);
        row.appendChild(statusCell);
        row.appendChild(actionCell);

        applicationList.appendChild(row);

    });

}


// =====================================
// 10. EDIT AND DELETE APPLICATIONS
// =====================================

applicationList.addEventListener("click", function (event) {

    const editButton = event.target.closest(".edit-btn");

    if (editButton && applicationList.contains(editButton)) {

        const id = Number(editButton.dataset.id);

        editApplication(id);

        return;

    }

    const deleteButton = event.target.closest(".delete-btn");

    if (deleteButton && applicationList.contains(deleteButton)) {

        const id = Number(deleteButton.dataset.id);

        const application = applications.find(
            app => app.id === id
        );

        if (!application) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete the application for ${application.company}?`
        );

        if (!confirmed) return;

        applications = applications.filter(
            app => app.id !== id
        );

        saveApplications();

        searchApplications();

        updateStatistics();

        updateSummary();

        showNotification("Application deleted successfully!");

    }

});


// =====================================
// 11. EDIT APPLICATION FUNCTION
// =====================================

function editApplication(id) {

    const application = applications.find(
        app => app.id === id
    );

    if (!application) return;

    editingId = id;

    document.getElementById("company").value =
        application.company;

    document.getElementById("position").value =
        application.position;

    document.getElementById("date").value =
        application.date;

    document.getElementById("status").value =
        application.status;

    formSection.hidden = false;

    jobForm.querySelector('button[type="submit"]').textContent =
        "Update Application";

}


// =====================================
// 12. UPDATE DASHBOARD STATISTICS
// =====================================

function updateStatistics() {

    totalApplications.textContent = applications.length;

    totalInterviews.textContent = applications.filter(
        app => app.status === "Interview"
    ).length;

    totalOffers.textContent = applications.filter(
        app => app.status === "Offered"
    ).length;

    totalRejected.textContent = applications.filter(
        app => app.status === "Rejected"
    ).length;

}


// =====================================
// 13. SEARCH AND FILTER
// =====================================

function searchApplications() {

    const searchValue = searchInput.value.toLowerCase().trim();

    const selectedStatus = filterStatus.value;

    const filteredApplications = applications.filter(function (app) {

        const matchesSearch =
            app.company.toLowerCase().includes(searchValue) ||
            app.position.toLowerCase().includes(searchValue);

        const matchesStatus =
            selectedStatus === "All" ||
            app.status === selectedStatus;

        return matchesSearch && matchesStatus;

    });

    displayApplications(filteredApplications);

}


searchInput.addEventListener("input", searchApplications);

filterStatus.addEventListener("change", searchApplications);


// =====================================
// 14. INITIALIZE APPLICATION
// =====================================

function initializeApp() {

    displayApplications();

    updateStatistics();

    updateSummary();

}

initializeApp();
