"use strict";

toastr.options = {
  "closeButton": true,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-top-center",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}

const FORM_NAME = 'link-store'
let myStore = store.get(FORM_NAME) || []

function CreateUUID() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

function sortArray(array, key, order) {
  if (order == 'desc') {
    return array.sort(function (a, b) {
      var x = a[key]; var y = b[key];
      return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
  } else {
    return array.sort(function (a, b) {
      var x = a[key]; var y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }
}

function renderLinks(data) {
  return data.map(item => (`
      <div class="item-card">
          <div class="item-card__points">
              <label class="point">${item.points}</label>
              <label>Points</label>
          </div>
          <div class="item-card__details">
            <div class="delete-icon" onclick='deleteLink("${item.id}")'><i class="fas fa-times-circle"></i></div>
            <div>
                <div class="item-card__details--title">
                    ${item.link_name}
                </div>
                <a href="${item.link_url}" target="_blank" class="item-card__details--link">
                    ${item.link_url}
                </a>
            </div>
            <div class="item-card__details--buttons">
                <button class="item-card__details--link" onclick='updatePoints("${item.id}", true)'>
                    <i class="fas fa-arrow-up"></i> Up Vote
                </button>
                <button class="item-card__details--link" onclick='updatePoints("${item.id}", false)'>
                    <i class="fas fa-arrow-down"></i> Down Vote
                </button>
            </div>
          </div>
      </div>
    `)
  )
}

function addLink(values) {
  let data = {
    id: CreateUUID(),
    points: 0,
    created_date: moment(),
    ...values,
  }

  // if created UUID is not unique create new one
  myStore.some((el) => (el.id === data.id)) ? data.id = CreateUUID() : data.id

  // if link name is not unique don't add it
  const isUniqueName = myStore.some((el) => (el.link_name === data.link_name))

  if (!isUniqueName) {
    myStore.push(data)
    store.set(FORM_NAME, myStore)
    toastr.success(`${data.link_name} added.`, 'Success')
  } else {
    toastr.error('Duplicated link name.', 'Error')
  }
}

function updatePoints(id, isUpvote) {
  const newStore = myStore.map(item => {
    let temp = Object.assign({}, item);
    if (temp.id === id) {
      isUpvote ? temp.points++ : temp.points > 0 && temp.points--
    }
    return temp
  })

  store.set(FORM_NAME, newStore)
  getLinks()
}

function getLinks(order = 'desc') {
  if ($('#pagination-container').length) {
    sortArray(myStore, "points", order);

    // initialize pagination
    $('#pagination-container').pagination({
      dataSource: myStore,
      pageSize: 5,
      callback: function(data, pagination) {
        const html = renderLinks(data);
        $('#data-container').html(html);
      }
    });
  }
}

function deleteLink(id) {
  myStore.map(item => {
    if (item.id === id) {
      Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to remove: ${item.link_name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.value) {
          myStore = myStore.filter(obj => obj.id !== id)
          store.set(FORM_NAME, myStore)
          toastr.success('Success', `${item.link_name} removed.`)
          getLinks()
        }
      })
    }
  })
}

$(document).ready(() => {
  getLinks();

  $('#linkForm').submit(function(e) {
    e.preventDefault();

    const link_name = $('#linkName').val()
    const link_url = $('#linkUrl').val()

    if (!link_name.length || !link_url.length) {
      toastr.error('Fill the missing inputs.', 'Error')
    } else {
      const data = {
        link_name,
        link_url
      }

      addLink(data);
    }
  });

  $('#order').change(function() {
    const selectedVal = $(this).children("option:selected").val()
    getLinks(selectedVal)
  });
});