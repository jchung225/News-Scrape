function getArticles() {
    $.getJSON("/articles", function(data) {
      populateArticles(data);
    });
  }
  
  function populateArticles(data) {
    $("#articles").empty();
    if (data.length === 0) {
      return $("#articles").append(`
        <div class="row">
        <div class="col s12 m12 l12">
          <div class="card blue-grey darken-1">
            <div class="card-content white-text">
              <p>Uh Oh. Looks like we don't have any new articles.</p>
            </div>
          </div>
        </div>
      </div>
        `)
    } else {
      data.map(x => {
        if (!x.isSaved) {
          return $("#articles").append(`
            <div class="row">
              <div class="col s12 m12">
                <div class="card horizontal blue-grey darken-1">
                  <div class="card-stacked">
                    <div class="card-content white-text">
                    <p>${x.title}</p>
                    <button data-id="${x._id}" data-saved="${x.isSaved}" class="btn-floating halfway-fab waves-effect waves-light red save-btn">Save</button>
                    </div>
                    <div class="card-action">
                    <a href="${x.link}" target="_blank">${x.link}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        `)
        }
      })
    }
  };
  
  
  
  $(document).ready(function(){
    $('.parallax').parallax();
    getArticles();
  });
  $(document).on('click', '.save-btn', (event) => {
    let isSaved;
    if (event.target.dataset.saved === "false") {
      isSaved = false;
    } else {
      isSaved = true;
    }
  
    $.ajax({
      url: "/articles/save/" + event.target.dataset.id,
      method: "POST",
      data: { saved: !isSaved }
    }).then((result) => {
      console.log(result);
    })
  })
  
  $(document).on('click', '#scrapeBtn', (event) => {
    $.ajax({
      url: "/scrape",
      method: "GET"
    }).then((data) => {
      getArticles();
    })
  })
  
  $(document).on('click', '#saveArticle', (event) => {
    $.ajax({
      url: "/articles/save",
      method: "GET"
    }).then((data) => {
      populateArticles(data);
    })
  })
  
  
  
  $(document).on("click", "p", function () {
    $("#notes").empty();
    var thisId = $(this).attr("data-id");
  
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      .then(function (data) {
        console.log(data);
        $("#notes").append("<h2>" + data.title + "</h2>");
        $("#notes").append("<input id='titleinput' name='title' >");
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
  
        if (data.note) {
          $("#titleinput").val(data.note.title);
          $("#bodyinput").val(data.note.body);
        }
      });
  });
  $(document).on("click", "#savenote", function () {
    var thisId = $(this).attr("data-id");
  
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        title: $("#titleinput").val(),
        body: $("#bodyinput").val()
      }
    })
      .then(function (data) {
        console.log(data);
        $("#notes").empty();
      });
  
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
  