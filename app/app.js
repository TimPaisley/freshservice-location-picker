function showModal(title, modalData) {
  client.interface.trigger('showModal', {
    title: title,
    template: 'modal.html',
    data: modalData || {}
  });
}

function addListeners() {
  jQuery('#show-modal').click(function () {
    showModal('Pick Location', {});
  });

  jQuery('#clear-location').click(function () {
    clearLocation();
  });
}

function disableFields() {
  client.interface.trigger("disableElement", { id: "location" })
    .then(function () { console.log("Location field disabled"); })
    .catch(function (error) { console.log("An error occurred while disabling the location field", error); });

  client.interface.trigger("disableElement", { id: "Incident address" })
    .then(function () { console.log("Address field disabled"); })
    .catch(function (error) { console.log("An error occurred while disabling the address field", error); });
}

function getLocation() {
  client.data.get("ticket").then(
    function (data) { return data.ticket.custom_field; },
    function () { return null; }
  );
}

function setLocation(geometry) {
  client.interface.trigger("setValue", { id: "location", value: geometry })
    .then(function () { console.log("Location successfully set"); })
    .catch(function (error) { console.log("An error occurred while setting the location", error); });
}

function setAddress(address) {
  client.interface.trigger("setValue", { id: "Incident address", value: address })
    .then(function () { console.log("Address successfully set"); })
    .catch(function (error) { console.log("An error occurred while setting the address", error); });
}

function clearLocation() {
  client.interface.trigger("setValue", { id: "location", value: "" })
    .then(function () { console.log("Location successfully cleared"); })
    .catch(function (error) { console.log("An error occurred while setting the location", error); });

  client.interface.trigger("setValue", { id: "Incident address", value: "" })
    .then(function () { console.log("Address successfully cleared"); })
    .catch(function (error) { console.log("An error occurred while setting the address", error); });
}

$(document).ready(function () {
  app.initialized()
    .then(function (_client) {
      window.client = _client;
      client.events.on('app.activated',
        function () {
          console.log("Successfully created Location Picker");
          addListeners();
          disableFields();
        });
    });
});