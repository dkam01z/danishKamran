setTimeout(function() {
  $("#preloader").fadeOut("slow", function() {
    $(this).remove();
  });
}, 1500);

$(window).on("load", function() {
  fetchPersonnel();
  fetchDepartments();
  fetchLocations();
});

function renderPersonnel(data) {
  $("#personnelTableBody").empty();
  var frag = document.createDocumentFragment();

  data.forEach((data) => {
    var row = document.createElement("tr");

    var nameCell = document.createElement("td");
    nameCell.classList.add("align-middle", "fullname", "text-nowrap");
    var nameText = document.createTextNode(`${data.firstName}, ${data.lastName}`);
    nameCell.append(nameText);
    row.append(nameCell);

    var departmentCell = document.createElement("td");
    departmentCell.classList.add("align-middle", "text-nowrap", "d-none", "d-md-table-cell");
    var departmentText = document.createTextNode(data.departmentName);
    departmentCell.append(departmentText);
    row.append(departmentCell);

    var locationCell = document.createElement("td");
    locationCell.classList.add("align-middle", "text-nowrap", "d-none", "d-md-table-cell");
    var locationText = document.createTextNode(data.locationName);
    locationCell.append(locationText);
    row.append(locationCell);

    var emailCell = document.createElement("td");
    emailCell.classList.add("align-middle", "text-nowrap", "d-none", "d-md-table-cell");
    var emailText = document.createTextNode(data.email);
    emailCell.append(emailText);
    row.append(emailCell);

    var actionsCell = document.createElement("td");
    actionsCell.classList.add("text-end", "text-nowrap");

    var editButton = document.createElement("button");
    editButton.type = "button";
    editButton.classList.add("btn", "btn-primary", "btn-sm");
    editButton.setAttribute("data-bs-toggle", "modal");
    editButton.setAttribute("data-bs-target", "#editPersonnelModal");
    editButton.setAttribute("data-id", data.id);
    var editIcon = document.createElement("i");
    editIcon.classList.add("fa-solid", "fa-pencil", "fa-fw");
    editButton.append(editIcon);
    actionsCell.append(editButton);

    var deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("btn", "btn-primary", "btn-sm", "mx-2", "deletePersonnelBtn");
    deleteButton.setAttribute("data-id", data.id);
    var deleteIcon = document.createElement("i");
    deleteIcon.classList.add("fa-solid", "fa-trash", "fa-fw");
    deleteButton.append(deleteIcon);
    actionsCell.append(deleteButton);

    row.append(actionsCell);
    frag.append(row);
  });
  $("#personnelTableBody").append(frag);

  $(".deletePersonnelBtn").click(function() {
    var id = $(this).data("id");
    $.ajax({
      url: `php/getPersonnelByID.php`,
      type: "POST",
      dataType: "json",
      data: { id: id },
      success: function(result) {
        if (result.status.code == 200) {
          var personnel = result.data.personnel[0];
          var name = personnel.firstName + ' ' + personnel.lastName;
          $('#deleteModalLabel').html('Remove employee?');
          $('#deleteMessage').html(`Are you sure that you want to remove the entry for <strong>${name}</strong>?`);
          $('#confirmDelete').data('id', id).data('entity', 'Personnel');
          $("#deleteModal").modal("show");
        } else {
          $("#errorMessage").text("Error retrieving data");
          $("#errorModal").modal("show");
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        $("#errorMessage").text("Error retrieving data");
        $("#errorModal").modal("show");
      }
    });
  });
}

function renderDepartment(departments) {
  $("#departmentTableBody").empty();
  var frag = document.createDocumentFragment();

  departments.forEach((dept) => {
    var row = document.createElement("tr");

    var nameCell = document.createElement("td");
    nameCell.classList.add("align-middle", "text-nowrap");
    var nameText = document.createTextNode(dept.departmentName);
    nameCell.append(nameText);
    row.append(nameCell);

    var locationCell = document.createElement("td");
    locationCell.classList.add("align-middle", "text-nowrap", "d-none", "d-md-table-cell");
    var locationText = document.createTextNode(dept.locationName);
    locationCell.append(locationText);
    row.append(locationCell);

    var actionsCell = document.createElement("td");
    actionsCell.classList.add("text-end", "text-nowrap");

    var editButton = document.createElement("button");
    editButton.type = "button";
    editButton.classList.add("btn", "btn-primary", "btn-sm", "me-2");
    editButton.setAttribute("data-bs-toggle", "modal");
    editButton.setAttribute("data-bs-target", "#editDepartmentModal");
    editButton.setAttribute("data-id", dept.id);
    var editIcon = document.createElement("i");
    editIcon.classList.add("fa-solid", "fa-pencil", "fa-fw");
    editButton.append(editIcon);
    actionsCell.append(editButton);

    var deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("btn", "btn-primary", "btn-sm", "deleteDepartmentBtn");
    deleteButton.setAttribute("data-id", dept.id);
    var deleteIcon = document.createElement("i");
    deleteIcon.classList.add("fa-solid", "fa-trash", "fa-fw");
    deleteButton.append(deleteIcon);
    actionsCell.append(deleteButton);

    row.append(actionsCell);
    frag.append(row);
  });

  $("#departmentTableBody").append(frag);

  $(".deleteDepartmentBtn").click(function() {
    var id = $(this).data("id");
    $.ajax({
      url: `php/checkDependencies.php`,
      type: "POST",
      dataType: "json",
      data: { id: id, entity: 'Department' },
      success: function(result) {
        if (result.status.code == 200) {
          $.ajax({
            url: `php/getDepartmentByID.php`,
            type: "POST",
            dataType: "json",
            data: { id: id },
            success: function(result) {
              if (result.status.code == 200) {
                var department = result.data[0];
                var name = department.name;
                $('#deleteModalLabel').html('Remove department?');
                $('#deleteMessage').html(`Are you sure that you want to remove the entry for <strong>${name}</strong>?`);
                $('#confirmDelete').data('id', id).data('entity', 'Department');
                $("#deleteModal").modal("show");
              } else {
                $("#errorMessage").text("Error retrieving data");
                $("#errorModal").modal("show");
              }
            },
            error: function(jqXHR, textStatus, errorThrown) {
              $("#errorMessage").text("Error retrieving data");
              $("#errorModal").modal("show");
            }
          });
        } else {
          var name = result.data.name;
          var count = result.data.count;
          $('#errorModalLabel').html('Cannot remove department');
          var errorMessage = `Cannot remove the entry <b>${name}</b> because it has <b>${count}</b> dependencies.`;
          $('#errorMessage').html(errorMessage);
          $('#errorModal').modal('show');
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        $("#errorMessage").text("Error checking dependencies");
        $("#errorModal").modal("show");
      }
    });
  });
}

function renderLocation(locations) {
  $("#locationTableBody").empty();
  var frag = document.createDocumentFragment();

  locations.forEach((location) => {
    var row = document.createElement("tr");

    var nameCell = document.createElement("td");
    nameCell.classList.add("align-middle", "text-nowrap");
    var nameText = document.createTextNode(location.name);
    nameCell.append(nameText);
    row.append(nameCell);

    var actionsCell = document.createElement("td");
    actionsCell.classList.add("align-middle", "text-end", "text-nowrap");

    var editButton = document.createElement("button");
    editButton.type = "button";
    editButton.classList.add("btn", "btn-primary", "btn-sm", "me-2");
    editButton.setAttribute("data-id", location.id);
    editButton.setAttribute("data-bs-toggle", "modal");
    editButton.setAttribute("data-bs-target", "#editLocationModal");
    var editIcon = document.createElement("i");
    editIcon.classList.add("fa-solid", "fa-pencil", "fa-fw");
    editButton.append(editIcon);
    actionsCell.append(editButton);

    var deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("btn", "btn-primary", "btn-sm", "deleteLocationBtn");
    deleteButton.setAttribute("data-id", location.id);
    var deleteIcon = document.createElement("i");
    deleteIcon.classList.add("fa-solid", "fa-trash", "fa-fw");
    deleteButton.append(deleteIcon);
    actionsCell.append(deleteButton);

    row.append(actionsCell);
    frag.append(row);
  });

  $("#locationTableBody").append(frag);

  $(".deleteLocationBtn").click(function() {
    var id = $(this).data("id");
    $.ajax({
      url: `php/checkDependencies.php`,
      type: "POST",
      dataType: "json",
      data: { id: id, entity: 'Location' },
      success: function(result) {
        if (result.status.code == 200) {
          $.ajax({
            url: `php/getLocationByID.php`,
            type: "POST",
            dataType: "json",
            data: { id: id },
            success: function(result) {
              if (result.status.code == 200) {
                var location = result.data[0];
                var name = location.name;
                $('#deleteModalLabel').html('Remove location?');
                $('#deleteMessage').html(`Are you sure that you want to remove the entry for <strong>${name}</strong>?`);
                $('#confirmDelete').data('id', id).data('entity', 'Location');
                $("#deleteModal").modal("show");
              } else {
                $("#errorMessage").text("Error retrieving data");
                $("#errorModal").modal("show");
              }
            },
            error: function(jqXHR, textStatus, errorThrown) {
              $("#errorMessage").text("Error retrieving data");
              $("#errorModal").modal("show");
            }
          });
        } else {
          var name = result.data.name;
          var count = result.data.count;
          $('#errorModalLabel').html('Cannot remove location');
          var errorMessage = `Cannot remove the entry <b>${name}</b> because it has <b>${count}</b> dependencies.`;
          $('#errorMessage').html(errorMessage);
          $('#errorModal').modal('show');
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        $("#errorMessage").text("Error checking dependencies");
        $("#errorModal").modal("show");
      }
    });
  });
}

$('#confirmDelete').click(function() {
  var id = $(this).data('id');
  var entity = $(this).data('entity');
  deleteEntity(id, entity);
});

function deleteEntity(id, entity) {
  $.ajax({
    url: `php/delete${entity.charAt(0).toUpperCase() + entity.slice(1)}ByID.php`,
    type: 'POST',
    data: { id: id },
    success: function(response) {
     
      if (response.status.code === "200") {
        $('#deleteModal').modal('hide');
        $('#successModal').modal('show');
        if (entity === "Personnel") fetchPersonnel();
        else if (entity === "Department") fetchDepartments();
        else fetchLocations();
      } else {
        $('#deleteModal').modal('hide');
        $('#errorMessage').html(response.status.description || "An error occurred during deletion.");
        $('#errorModal').modal('show');
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      $('#deleteModal').modal('hide');
      $('#errorMessage').html("Network or server error, please try again.");
      $('#errorModal').modal('show');
      console.error('Network or server error during deletion:', textStatus, errorThrown);
    }
  });
}

function fetchPersonnel(query = '') {
  $.ajax({
    url: "php/getAll.php",
    data: {
      txt: query,
    },
    success: function(response) {
      renderPersonnel(response.data.found);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("Error fetching data: ", textStatus, errorThrown);
    }
  });
}

function fetchDepartments(query = '') {
  $.ajax({
    url: "php/getAllDepartments.php",
    data: {
      txt: query,
    },
    success: function(response) {
      renderDepartment(response.data);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("Error fetching data: ", textStatus, errorThrown);
    }
  });
}

function fetchLocations(query = '') {
  $.ajax({
    url: "php/getAllLocations.php",
    data: {
      txt: query,
    },
    success: function(response) {
      renderLocation(response.data);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("Error fetching data: ", textStatus, errorThrown);
    }
  });
}

function updateDepartmentDropdown(id, departments) {
  var $dropdown = $(id);
  $dropdown.empty();
  $dropdown.append($('<option>').val("").text("Select Department").prop("disabled", false).prop("selected", true));
  $.each(departments, function(index, department) {
    var name = department.departmentName;
    var id = department.id;
    $dropdown.append(new Option(name, id));
  });
}

function updateLocations(id, locations) {
  var $dropdown = $(id);
  $dropdown.empty();
  $dropdown.append($('<option>').val("").text("Select Location").prop("disabled", false).prop("selected", true));
  $.each(locations, function(index, location) {
    var name = location.name;
    var id = location.id;
    $dropdown.append(new Option(name, id));
  });
}

$("#searchInp").on("keyup", function() {
  let query = this.value;
  fetchPersonnel(query);
  fetchDepartments(query);
  fetchLocations(query);
});

$("#refreshBtn").click(function() {
  if ($("#personnelBtn").hasClass("active")) {
    fetchPersonnel();
    $('#searchInp').val('')
  } else {
    if ($("#departmentsBtn").hasClass("active")) {
      fetchDepartments();
      $('#searchInp').val('')
    } else {
      fetchLocations();
      $('#searchInp').val('')
    }
  }
});

$("#filterBtn").click(function() {
  var activeTab = $('.nav-link.active').attr('id');
  if (activeTab === 'personnelBtn') {
    $('#filterPersonnelDeptModal').modal('show');
  } else if (activeTab === 'departmentsBtn') {
    $('#filterPersonnelDeptModal').modal('show');
  } else if (activeTab === 'locationsBtn') {
    $('#filterLocationModal').modal('show');
  }
});



var lastSelectedDepartment = '';
var lastSelectedLocation = '';

$('#filterDepartment').on('change', function() {
  $('#filterLocation').val('');
  lastSelectedDepartment = $(this).val();
});

$('#filterLocation').on('change', function() {
  $('#filterDepartment').val('');
  lastSelectedLocation = $(this).val();
});

$('#filterLocations').on('change', function() {
  $('#filterDepartment').val('');
  lastSelectedLocation = $(this).val();
});



$('#filterPersonnelDeptModal').on('show.bs.modal', function() {

var currentFilterDepartmentSelect = $('#filterDepartment').val();
var currentFilterLocationSelect = $('#filterLocation').val();

  $('#filterDepartment').empty();
  $('#filterLocation').empty(); 

  $.ajax({
    url: 'php/getAllLocations.php',
    data: { txt: '' },
    type: "GET",
    dataType: "json",
    success: function(response) {
      if (response.status && response.status.code === "200") {
        updateLocations('#filterLocation', response.data);
        $('#filterLocation').val(currentFilterLocationSelect); 
      } else {
        console.error('Failed to fetch locations:', response.status.description);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("Error fetching locations: ", errorThrown);
    }
  });

  $.ajax({
    url: 'php/getAllDepartments.php',
    data: { txt: '' },
    type: "GET",
    dataType: "json",
    success: function(response) {
      if (response.status && response.status.code === "200") {
        updateDepartmentDropdown('#filterDepartment', response.data);
        $('#filterDepartment').val(currentFilterDepartmentSelect); 
      } else {
        console.error('Failed to fetch departments:', response.status.description);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("Error fetching departments: ", errorThrown);
    }
  });
});

$('#filterLocationModal').on('show.bs.modal', function() {
  var currentFilterLocationSelect = $('#filterLocations').val();


  $('#filterLocations').empty();

  $.ajax({
    url: 'php/getAllLocations.php',
    data: { txt: '' },
    type: "GET",
    dataType: "json",
    success: function(response) {
      if (response.status && response.status.code === "200") {
        updateLocations('#filterLocations', response.data);
        $('#filterLocations').val(currentFilterLocationSelect); // Restore the selected value
      } else {
        console.error('Failed to fetch locations:', response.status.description);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("Error fetching locations: ", errorThrown);
    }
  });
})

$('#filterPersonnelDeptForm').on('change', function(e) {
  e.preventDefault();

  var departmentID = $('#filterDepartment').val();
  var locationID = $('#filterLocation').val();
  var activeTab = $('.nav-link.active').attr('id');
  var entity = activeTab === 'personnelBtn' ? 'Personnel' : activeTab === 'departmentsBtn' ? 'Department' : 'Location';

  $.ajax({
    url: `php/filter${entity}.php`,
    data: {
      departmentID: departmentID,
      locationID: locationID
    },
    type: "POST",
    dataType: "json",
    success: function(response) {
      if (response.status && response.status.code === "200") {
        if (entity === 'Personnel') {
          renderPersonnel(response.data);
        } else if (entity === 'Department') {
          renderDepartment(response.data);
        }
      } else {
        $('#footerMessage').html(response.status.description);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("Error fetching: " + errorThrown);
    }
  });
});

$('#filterLocationForm').on('change', function(e) {
  e.preventDefault();

  var locationID = $('#filterLocations').val();
 

  $.ajax({
    url: `php/filterLocation.php`,
    data: {
      locationID: locationID,
    },
    type: "POST",
    dataType: "json",
    success: function(response) {
      if (response.status && response.status.code === "200") {
        renderLocation(response.data)
      } else {
        $('#footerMessage').html(response.status.description)
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("Error fetching: " + errorThrown);
    }
  });
});

$("#addBtn").click(function() {
  var activeTab = $('.nav-link.active').attr('id');
  if (activeTab === 'personnelBtn') {
    $('#addEmployeeModal').modal('show');
  } else if (activeTab === 'departmentsBtn') {
    $('#addDepartmentModal').modal('show');
  } else if (activeTab === 'locationsBtn') {
    $('#addLocationModal').modal('show');
  }
});

$("#personnelBtn").click(function() {
  fetchPersonnel();
});

$("#departmentsBtn").click(function() {
  fetchDepartments();
});

$("#locationsBtn").click(function() {
  fetchLocations();
});

$('#addEmployeeModal').on('show.bs.modal', function(e) {
  $.ajax({
    url: "php/getAllDepartments.php",
    type: "GET",
    data: {txt: ''},
    dataType: "json",
    success: function(response) {
      if (response.status && response.status.code === "200") {
        updateDepartmentDropdown('#department', response.data);
      } else {
        console.error('Failed to fetch departments:', response.status.description);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("Error fetching departments: ", textStatus, errorThrown);
    }
  });
});

$('#addDepartmentModal').on('show.bs.modal', function(e) {
  $.ajax({
    url: "php/getAllLocations.php",
    type: "GET",
    data: {txt: ''},
    dataType: "json",
    success: function(response) {
      if (response.status && response.status.code === "200") {
        updateLocations('#location', response.data);
      } else {
        console.error('Failed to fetch locations:', response.status.description);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("Error fetching locations: ", textStatus, errorThrown);
    }
  });
});

$('#editPersonnelModal').on('show.bs.modal', function(e) {
  var trigger = $(e.relatedTarget);
  var id = trigger.data('id');

  $.ajax({
    url: 'php/getPersonnelByID.php',
    type: 'POST',
    dataType: 'json',
    data: { id: id },
    success: function(result) {
      if (result.status.code == 200) {
        var personnel = result.data.personnel[0];
        $('#editPersonnelEmployeeID').val(personnel.id);
        $('#editPersonnelFirstName').val(personnel.firstName);
        $('#editPersonnelLastName').val(personnel.lastName);
        $('#editPersonnelJobTitle').val(personnel.jobTitle);
        $('#editPersonnelEmailAddress').val(personnel.email);
        $('#editPersonnelDepartment').html('');
        $.each(result.data.department, function() {
          $('#editPersonnelDepartment').append(
            $('<option>', {
              value: this.id,
              text: this.name
            })
          );
        });
        $('#editPersonnelDepartment').val(personnel.departmentID);
      } else {
        console.error("Error retrieving data");
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("Error retrieving data");
    }
  });
});

$('#editDepartmentModal').on('show.bs.modal', function(e) {
  var trigger = $(e.relatedTarget);
  var id = trigger.data('id');

  $.ajax({
    url: 'php/getDepartmentByID.php',
    type: 'POST',
    dataType: 'json',
    data: { id: id },
    success: function(result) {
      if (result.status.code == 200) {
        var data = result.data[0];
        var location = result.data.location;
        $('#editDepartmentID').val(data.id);
        $('#editDepartmentName').val(data.name);
        $('#editDepartmentLocation').html('');
        $.each(location, function() {
          $('#editDepartmentLocation').append(
            $('<option>', {
              value: this.id,
              text: this.name
            })
          );
        });
        $('#editDepartmentLocation').val(data.locationID);
      } else {
        console.error("Error retrieving data");
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("Error retrieving data");
    }
  });
});





$('#editLocationModal').on('show.bs.modal', function (e) {
  var trigger = $(e.relatedTarget);
  var id = trigger.data('id');

  $.ajax({
      url: 'php/getLocationByID.php',
      type: 'POST',
      dataType: 'json',
      data: { id: id },
      success: function(result) {
          if (result.status.code == 200) {
              var data = result.data[0];
              $('#editLocationID').val(data.id);
              $('#editLocationName').val(data.name);
          } else {
              console.error("Error retrieving data");
          }
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.error("Error retrieving data");
      }
  });
});




$("#addPersonnelForm").on("submit", function (e) {

    e.preventDefault();

    var firstName = $('#addPersonnelFirstName').val();  
    var lastName = $('#addPersonnelLastName').val();    
    var email = $('#addPersonnelEmailAddress').val();  
    var jobTitle = $('#addPersonnelJobTitle').val();   
    var department = $('#department').val();

   
  
    $.ajax({
      url: "php/insertPersonnel.php",
      data: {
          firstName: firstName,
          lastName: lastName,
          email: email,
          jobTitle: jobTitle,
          department: department
      },
      success: function(response) {
       
          if (response.status.code === '200') {
            $('#addEmployeeModal').modal('hide');
            $('#successModal').modal('show');
            fetchPersonnel();
          } else {
              console.error('Failed to add employee: ' + response.status.description);
          }
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.error('Error: ' + errorThrown);
      }
    })
  
  
  });


  $("#addDepartmentForm").on("submit", function (e) {

    e.preventDefault();

    var department = $('#addDepartmentName').val();  
    var location_id = $('#location').val();  
    

    $.ajax({
        url: "php/insertDepartment.php",
        data: {
            department: department,
            id: location_id
        },


        success: function(response) {
            if (response.status.code === '200') {
                
                $('#addDepartmentModal').modal('hide');
                $('#successModal').modal('show');
                fetchDepartments();
              } else {
                  console.error('Failed to add employee: ' + response.status.description);
              }
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error: ' + errorThrown);
        }
    })

  
  
  });


  $("#addLocationForm").on("submit", function (e) {

    e.preventDefault();

    var location = $('#addLocationName').val();  
    
    

    $.ajax({
        url: "php/insertLocations.php",
        data: {
            location: location
        },


        success: function(response) {
            if (response.status.code === '200') {
                
                $('#addLocationModal').modal('hide');
                $('#successModal').modal('show');
                fetchLocations();
              } else {
                  console.error('Failed to add employee: ' + response.status.description);
              }
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.error('Error: ' + errorThrown);
        }
    })

  
  
  });






$("#editPersonnelForm").on("submit", function (e) {

    e.preventDefault();
    var id = $('#editPersonnelEmployeeID').val();
    var firstName = $('#editPersonnelFirstName').val();
    var lastName = $('#editPersonnelLastName').val();
    var jobTitle = $('#editPersonnelJobTitle').val();
    var email = $('#editPersonnelEmailAddress').val();
    var departmentID = $('#editPersonnelDepartment').val();

    $.ajax({
        url: "php/updatePersonnel.php",
        data: {
            id: id,
            firstName: firstName,
            lastName: lastName,
            jobTitle: jobTitle,
            email: email,
            departmentID: departmentID
        },

        success: function(response) {
            if (response.status.code === '200') {
                
                $('#editPersonnelModal').modal('hide');
                $('#successModal').modal('show');
                fetchPersonnel();
              } else {
                  console.error('Failed to add employee: ' + response.status.description);
              }
        },

        
        error: function(jqXHR, textStatus, errorThrown) {
          console.error('Error: ' + errorThrown);
      }

    })


 
});

$("#editDepartmentForm").on("submit", function (e) {

  e.preventDefault();
  var id = $('#editDepartmentID').val();
  var department = $('#editDepartmentName').val();
  var location = $('#editDepartmentLocation').val();


  $.ajax({
      url: "php/updateDepartment.php",
      data: {
          id: id,
          department: department,
          location: location,
      },

      success: function(response) {
         
          if (response.status.code === '200') {
              
              $('#editDepartmentModal').modal('hide');
              $('#successModal').modal('show');
              fetchDepartments();
            } else {
                console.error('Failed to edit department: ' + response.status.description);
            }
      },

      
      error: function(jqXHR, textStatus, errorThrown) {
        console.error('Error: ' + errorThrown);
    }

  })



});


$("#editLocationForm").on("submit", function (e) {
  e.preventDefault();
  var id = $('#editLocationID').val();
  var location = $('#editLocationName').val();



  $.ajax({
      url: "php/updateLocation.php",
      data: {
          id: id,
          location: location,
      },

      success: function(response) {
          if (response.status.code === '200') {
              
              $('#editLocationModal').modal('hide');
              $('#successModal').modal('show');
              fetchLocations();
            } else {
                console.error('Failed to edit Location: ' + response.status.description);
            }
      },

      
      error: function(jqXHR, textStatus, errorThrown) {
        console.error('Error: ' + errorThrown);
    }

  })



});

