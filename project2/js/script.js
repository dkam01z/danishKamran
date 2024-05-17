setTimeout(function() {
    $("#preloader").fadeOut("slow", function() {
        $(this).remove(); 
    });
  }, 1500); 


  $(window).on("load", function() {
    fetchPersonnel();
    fetchDepartments();
    fetchLocations();
  })


function renderPersonnel(data) {
    $("#personnelTableBody").empty();
    
    data.forEach((data) => {
        var newRow = ` <tr>
        <td class="align-middle fullname text-nowrap">${data.firstName}, ${data.lastName}</td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">
          ${data.departmentName}
        </td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">
          ${data.locationName}
        </td>
        <td class="align-middle text-nowrap d-none d-md-table-cell">
          ${data.email}
        </td>
        <td class="text-end text-nowrap">
          <button
            type="button"
            class="btn btn-primary btn-sm"
            data-bs-toggle="modal"
            data-bs-target="#editPersonnelModal"
            data-id=${data.id}
          >
            <i class="fa-solid fa-pencil fa-fw"></i>
          </button>
          <button type="button" class="btn btn-primary btn-sm "
            data-bs-toggle="modal"
            data-bs-target="#deleteModal"
            data-id="${data.id}"
            data-entity="personnel"
            data-name="${data.firstName} ${data.lastName}">
            <i class="fa-solid fa-trash fa-fw"></i>
        </button>
        </td>
      </tr>`;
      $("#personnelTableBody").append(newRow);
    });
  }

  function renderDepartment(departments) {
    
    $("#departmentTableBody").empty(); 

    
    departments.forEach((dept) => {
        var newRow = `<tr>
            <td class="align-middle text-nowrap">${dept.departmentName}</td>
            <td class="align-middle text-nowrap d-none d-md-table-cell">${dept.locationName}</td>
            <td class="align-middle text-end text-nowrap">
                <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${dept.id}">
                    <i class="fa-solid fa-pencil fa-fw"></i>
                </button>
                <button type="button" class="btn btn-primary btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#deleteModal"
                data-id="${dept.id}"
                data-entity="department"
                data-name="${dept.departmentName}">
                <i class="fa-solid fa-trash fa-fw"></i>
            </button>
            </td>
        </tr>`;

        $("#departmentTableBody").append(newRow);
    });
}

function renderLocation(locations) {
   
    $("#locationTableBody").empty();
  
   
    locations.forEach((location) => {
      var newRow = `
        <tr>
          <td class="align-middle text-nowrap">${location.name}</td>
          <td class="align-middle text-end text-nowrap">
            <button type="button" class="btn btn-primary btn-sm" data-id="${location.id}" data-bs-toggle="modal" data-bs-target="#editLocationModal">
              <i class="fa-solid fa-pencil fa-fw"></i>
            </button>
            <button type="button" class="btn btn-primary btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#deleteModal"
                data-id="${location.id}"
                data-entity="location"
                data-name="${location.name}">
                <i class="fa-solid fa-trash fa-fw"></i>
            </button>
          </td>
        </tr>`;
      $("#locationTableBody").append(newRow);
    });
  }
  

  

  function fetchPersonnel(query = '') {
    $.ajax({
      url: "php/searchAll.php",
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
            updateDepartmentDropdown('#department', response.data);
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
            updateLocations('#location',response.data);
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
    $dropdown.append($('<option>').val("").text("Select a department").prop("disabled", true).prop("selected", true)); 
    $.each(departments, function(index, department) {
        var name = department.departmentName;
        var id = department.id
        $dropdown.append(new Option(name,id));
    })


   
}

function updateLocations(id, locations) {
    var $dropdown = $(id); 
    $dropdown.empty(); 
    $dropdown.append($('<option>').val("").text("Select a location").prop("disabled", true).prop("selected", true)); 
    $.each(locations, function(index, location) {
        var name = location.name;
        var id = location.id
        $dropdown.append(new Option(name,id));
    })

}

  $("#searchInp").on("keyup", function () {
    let query = this.value; 
    fetchPersonnel(query);
    fetchDepartments(query);
    fetchLocations(query);
  });
  

$("#refreshBtn").click(function () {
  if ($("#personnelBtn").hasClass("active")) {
    fetchPersonnel();
  } else {
    if ($("#departmentsBtn").hasClass("active")) {
      fetchDepartments();
    } else {  
        fetchLocations();
    }
  }
});

$("#filterBtn").click(function () {
  var activeTab = $('.nav-link.active').attr('id');
  if (activeTab === 'personnelBtn') {
    $('#filterPersonnelDeptModal').modal('show');
} else if (activeTab === 'departmentsBtn') { 
    $('#filterPersonnelDeptModal').modal('show');
} else if (activeTab === 'locationsBtn') {    
  $('#filterLocationModal').modal('show');
}
});

$('#filterPersonnelDeptModal').on('show.bs.modal', function() {
  $.ajax({
      url: 'php/getAllDepartments.php',
      data : {txt: ''},
      type: "GET",
      dataType: "json",
      success: function(response) {
       
          if (response.status && response.status.code === "200") {
              updateDepartmentDropdown('#filterDepartment', response.data);  
          } else {
              console.error('Failed to fetch departments:', response.status.description);
          }
      },
      error: function(jqXHR, textStatus, errorThrown) {
          console.error("Error fetching departments: ", errorThrown);
      }
  });

  $.ajax({
    url: 'php/getAllLocations.php',
    data : {txt: ''},
    type: "GET",
    dataType: "json",
    success: function(response) {
 
        if (response.status && response.status.code === "200") {
            updateLocations('#filterLocation', response.data);  
        } else {
            console.error('Failed to fetch locations:', response.status.description);
        }
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.error("Error fetching locations: ", errorThrown);
    }
});
});


$('#filterLocationModal').on('show.bs.modal', function() {
  $.ajax({
    url: 'php/getAllLocations.php',
    data : {txt: ''},
    type: "GET",
    dataType: "json",
    success: function(response) {
     
        if (response.status && response.status.code === "200") {
            updateLocations('#filterLocations', response.data);  
        } else {
            console.error('Failed to fetch locations:', response.status.description);
        }
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.error("Error fetching locations: ", errorThrown);
    }
});
});

$('#filterPersonnelDeptForm').on('submit', function(e) {
  e.preventDefault();

  var departmentID = $('#filterDepartment').val();
  var locationID = $('#filterLocation').val();
  var activeTab = $('.nav-link.active').attr('id');
  var entity = activeTab === 'personnelBtn' ? 'Personnel' : activeTab === 'departmentsBtn' ? 'Department' : 'Location';

  console.log(entity)

  $.ajax({
    url: `php/filter${entity}.php`,
    data: { 
      departmentID: departmentID,
      locationID: locationID
    },
    type: "POST",
    dataType: "json",
    success: function(response) {
      console.log(response)
      if (response.status && response.status.code === "200") {
        if (entity === 'Personnel') {
          renderPersonnel(response.data);
        } else if (entity === 'Department') {
          renderDepartment(response.data);
        }
      } else {
        $('#footerMessage').html(response.status.description)
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("Error fetching: " + errorThrown);
    }
  });
});

$('#filterLocationForm').on('submit', function(e) {
  e.preventDefault();

  var locationID = $('#filterLocations').val();

  console.log(locationID)

  $.ajax({
    url: `php/filterLocation.php`,
    data: { 
      locationID: locationID,
    },
    type: "POST",
    dataType: "json",
    success: function(response) {
      console.log(response)
      if (response.status && response.status.code === "200") {
        renderLocation(response.data)
      } else {
        $('#footerMessage').html(response.status.description)
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("Error fetching: " +  errorThrown);
    }
  });
});




$("#addBtn").click(function() {
    var activeTab = $('.nav-link.active').attr('id');
    if (activeTab === 'personnelBtn') {
        $('#addEmployeeModal').modal('show');
        $('#addEmployeeModal').on('show.bs.modal', function () {
            fetchDepartments();
            
        });
    } else if (activeTab === 'departmentsBtn') { 
        $('#addDepartmentModal').modal('show');
    } else if (activeTab === 'locationsBtn') {    
        $('#addLocationModal').modal('show');
    }
});


$("#personnelBtn").click(function () {
  fetchPersonnel();
});

$("#departmentsBtn").click(function () {
  fetchDepartments();
});

$("#locationsBtn").click(function () {
  fetchLocations();
});

$("#editPersonnelModal").on("show.bs.modal", function (e) {
  $.ajax({
    url: "php/getPersonnelByID.php",
    type: "POST",
    dataType: "json",
    data: {

      id: $(e.relatedTarget).attr("data-id"),
    },
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {

        $("#editPersonnelEmployeeID").val(result.data.personnel[0].id);

        $("#editPersonnelFirstName").val(result.data.personnel[0].firstName);
        $("#editPersonnelLastName").val(result.data.personnel[0].lastName);
        $("#editPersonnelJobTitle").val(result.data.personnel[0].jobTitle);
        $("#editPersonnelEmailAddress").val(result.data.personnel[0].email);

        $("#editPersonnelDepartment").html("");

        
    
        $.each(result.data.department, function () {
          $("#editPersonnelDepartment").append(
            $("<option>", {
              value: this.id,
              text: this.name,
            })
          );
        });

        $("#editPersonnelDepartment").val(
          result.data.personnel[0].departmentID
        );
      } else {
        $("#editPersonnelModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editPersonnelModal .modal-title").replaceWith(
        "Error retrieving data"
      );
    },
  });
});


$("#editDepartmentModal").on("show.bs.modal", function (e) {

  $.ajax({
    url: "php/getDepartmentByID.php",
    type: "POST",
    dataType: "json",
    data: {
      id: $(e.relatedTarget).attr("data-id"),
    },
    success: function (result) {
      var resultCode = result.status.code;

      if (resultCode == 200) {
        var data = result.data[0];
        var location = result.data.location

        
     
        $("#editDepartmentID").val(data.id);
        $("#editDepartmentName").val(data.name);
      

        $("#editPersonnelDepartment").html("");

        $.each(location, function () {
          $("#editDepartmentLocation").append(
            $("<option>", {
              value: this.id,
              text: this.name,
            })
          );
        });

        $("#editDepartmentLocation").val(
          data.locationID
        );
      } else {
        $("#editDepartmentModal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editDepartmentModal .modal-title").replaceWith(
        "Error retrieving data"
      );
    },
  });
});


$('#deleteModal').on('show.bs.modal', function (e) {
  var trigger = $(e.relatedTarget);
  var id = trigger.data('id');
  var entity = trigger.data('entity');
  var name = trigger.data('name');

  var entityName = entity === "personnel" ? "employee" : entity;
  var message = `Are you sure you want to delete this ${entityName} named <strong>${name}</strong>?`;
  $('#deleteMessage').html(message);
  $('#confirmDelete').data('id', id).data('entity', entity);
});

$('#confirmDelete').click(function() {
  var id = $(this).data('id');
  var entity = $(this).data('entity');

  $.ajax({
      url: `php/delete${entity.charAt(0).toUpperCase() + entity.slice(1)}ByID.php`,
      type: 'POST',
      data: { id: id },
      success: function(response) {
          if (response.status.code === "200") {
              $('#deleteModal').modal('hide');
              $('#successModal').modal('show');
              if(entity === "personnel") fetchPersonnel();
              else if(entity === "department") fetchDepartments();
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
      }
  });
});



$("#editLocationModal").on("show.bs.modal", function (e) {

  $.ajax({
    url: "php/getLocationByID.php",
    type: "POST",
    dataType: "json",
    data: {
      id: $(e.relatedTarget).attr("data-id"),
    },
    success: function (result) {

     
      var resultCode = result.status.code;

      if (resultCode == 200) {
        var data = result.data[0];

        
     
        $("#editLocationID").val(data.id);
        $("#editLocationName").val(data.name);

      } else {
        $("#editLocationModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $("#editLocationModal .modal-title").replaceWith(
        "Error retrieving data"
      );
    },
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

