function loginBtn() {
  let name = document.getElementById("name").value;
  let pw = document.getElementById("pw").value;

  const params = {
    username: name,
    password: pw,
  };

  axios
    .post("https://tarmeezacademy.com/api/v1/login", params)
    .then((response) => {
      //   localStorage.setItem("token", JSON.stringify(response.data.token));
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("c_user", JSON.stringify(response.data.user));

      const model = document.getElementById("login_Model");
      const modelBootsrap = bootstrap.Modal.getInstance(model);
      modelBootsrap.hide();
      showSuccessAlert("Success Login", "success");
      setupNav();
    });
}
function register() {
  let name = document.getElementById("reg_name").value;
  let username = document.getElementById("reg_username").value;
  let pw = document.getElementById("reg_pw").value;
  let image = document.getElementById("reg_profile").files[0];

  let formData = new FormData();
  formData.append("username", username);
  formData.append("password", pw);
  formData.append("image", image);
  formData.append("name", name);

  const headers = {
    "Content-Type": "multipart/form-data",
  };

  axios
    .post("https://tarmeezacademy.com/api/v1/register", formData, {
      headers: headers,
    })
    .then((response) => {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("c_user", JSON.stringify(response.data.user));

      const model = document.getElementById("regis_Model");
      const modelBootsrap = bootstrap.Modal.getInstance(model);
      modelBootsrap.hide();

      showSuccessAlert("Success Register", "success");

      console.log("===========================");
      setupNav();
      console.log("===========================");

      console.log(response);
    })
    .catch((err) => {
      showSuccessAlert(err, "danger");
    });
}
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("c_user");

  showSuccessAlert("LogOut Success", "primary");

  setupNav();
}
function getCurrentUser() {
  let user = null;
  const storageUser = localStorage.getItem("c_user");
  if (storageUser != null) {
    user = JSON.parse(storageUser);
  }
  return user;
}
function showSuccessAlert(custom, color = "success") {
  const alertPlaceholder = document.getElementById("success_alert");

  const appendAlert = (custom, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${custom}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      "</div>",
    ].join("");

    alertPlaceholder.append(wrapper);
  };

  appendAlert(custom, color);

  const alertToHide = bootstrap.Alert.getOrCreateInstance("#success_alert");
  setTimeout(() => {
    alertToHide.close();
  }, 2000);
}
function setupNav() {
  const token = localStorage.getItem("token");
  const logBtn = document.getElementById("conLog");
  const outBtn = document.getElementById("conOut");
  const btnPost = document.getElementById("add_btn");

  if (token != null) {
    if (btnPost != null) {
      btnPost.style.setProperty("display", "block", "important");
    }
    logBtn.style.setProperty("display", "none", "important");
    outBtn.style.setProperty("display", "flex", "important");
    let user = getCurrentUser();
    document.getElementById("Nav_Username").innerHTML = user.username;
    document.getElementById("nav_Image").src = user.profile_image;
  } else {
    if (btnPost != null) {
      btnPost.style.setProperty("display", "none", "important");
    }
    logBtn.style.setProperty("display", "flex", "important");
    outBtn.style.setProperty("display", "none", "important");
  }
}
function checkImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}
function profileClick() {
  const user = getCurrentUser();
  console.log(user);
  const userId = user.id;
  console.log(userId);

  window.location = `profile.html?userId=${userId}`;
}
////////// AUTH \\\\\\\\\\
let currentPage = 1;
let lastPage = 1;

async function getPost(reload = true, page = 1) {
  try {
    toggleLoader(true);
    const response = await axios.get(
      `https://tarmeezacademy.com/api/v1/posts?limit=7&page=${page}`
    );
    toggleLoader(false);
    lastPage = response.data.meta.last_page;
    const posts = response.data.data;

    if (reload) {
      document.getElementById("posts").innerHTML = "";
      reload = false;
    }

    console.log(posts);
    console.log("-------");

    const postsHtml = await Promise.all(
      posts.map(async (post) => {
        const user = getCurrentUser();
        const isMyPost = user && post.author.id === user.id;

        const editBtnContent = isMyPost
          ? `
              <button id="edit_post_btn" class="btn btn-secondary" style="float:right;"
                onclick="editPostBtnClicked('${encodeURIComponent(
                  JSON.stringify(post)
                )}')">
                edit
              </button>

              <button id="btn_delete_post" class="btn btn-danger me-1" style="float:right;"
                onclick="deletePostClicked('${encodeURIComponent(
                  JSON.stringify(post)
                )}')">
                delete
              </button>`
          : "";

        // profile image
        let imageUrlProfile =
          typeof post.author.profile_image === "string"
            ? post.author.profile_image
            : post.author.profile_image?.url ||
              "assets/profile_pic/nature-4.jpg";
        // post image
        let imageUrlPost =
          typeof post.image === "string"
            ? post.image
            : post.image?.url || "assets/profile_pic/nature-4.jpg";

        const profileImg = (await checkImage(imageUrlProfile))
          ? imageUrlProfile
          : "assets/profile_pic/nature-4.jpg";
        const postImage = (await checkImage(imageUrlPost))
          ? imageUrlPost
          : "assets/profile_pic/nature-4.jpg";

        const username = post.author.username || "@Ahmed Hossam";
        const title = post.title || "Special title treatment";
        const body =
          post.body !== "---" && post.body !== "--"
            ? post.body
            : "With supporting text below as a natural lead-in to additional content.";

        const tagsHtml = post.tags
          .map(
            (tag) => `<span class="badge bg-secondary mx-1">${tag.name}</span>`
          )
          .join("");

        return `
          <div class="card shadow-sm mb-3">
              <div class="card-header">
                  <span onclick="userClicked(${post.author.id})" style="cursor: pointer">
                        <img src="${profileImg}" alt="image" style="width: 45px; height: 45px;" class="img-thumbnail rounded-circle">
                        <b>${username}</b>
                  </span>

                  ${editBtnContent}
              </div>
              <div class="card-body" onclick="postClicked(${post.id})">
                  <img src="${postImage}" alt="image" class="w-100"
                      style="height: 300px; object-fit: cover;">
                  <p class="text-secondary">${post.created_at}</p>
                  <h5 class="card-title">${title}</h5>
                  <p class="card-text">${body}</p>
                  <hr>
                  <div class="d-flex">
                      <i class="bi bi-pen mx-1"></i>
                      <span>(${post.comments_count}) comments</span>
                      <span id="post-tags-${post.id}">${tagsHtml}</span>
                  </div>
              </div>
          </div>`;
      })
    );

    document.getElementById("posts").innerHTML += postsHtml.join("");
  } catch (error) {
    console.error(error);
    showSuccessAlert(err, "danger");
  }
}
function userClicked(id) {
  window.location = `profile.html?userId=${id}`;
}
function postClicked(id) {
  window.location = `postDetails.html?postId=${id}`;
}
function createPost() {
  let titleInput = document.getElementById("title");
  let bodyInput = document.getElementById("body_post");
  let imageInput = document.getElementById("image");

  let title = titleInput.value;
  let body = bodyInput.value;
  let image = imageInput.files[0];

  let formData = new FormData();
  formData.append("body", body);
  formData.append("title", title);
  formData.append("image", image);

  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "multipart/form-data",
    authorization: `Bearer ${token}`,
  };

  let URL = `https://tarmeezacademy.com/api/v1/posts`;
  axios
    .post(URL, formData, {
      headers: headers,
    })
    .then((response) => {
      const model = document.getElementById("btn_create_post");
      const modelBootsrap = bootstrap.Modal.getInstance(model);

      titleInput.value = "";
      bodyInput.value = "";
      imageInput.value = "";

      modelBootsrap.hide();
      showSuccessAlert("Success add post", "success");
      getPost();
    })
    .catch((err) => {
      showSuccessAlert(err, "danger");
    });
}
function editPostBtnClicked(postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));

  console.log(post);

  document.getElementById("is_edit_post_input").value = post.id;
  document.getElementById("title_edit").value = post.title;
  document.getElementById("body_edit").value = post.body;
  let postModel = new bootstrap.Modal(
    document.getElementById("btn_edit_post"),
    {}
  );
  postModel.toggle();
}
function editPost() {
  let postId = document.getElementById("is_edit_post_input").value;
  let titleInput = document.getElementById("title_edit");
  let bodyInput = document.getElementById("body_edit");
  let imageInput = document.getElementById("image_edit");

  let title = titleInput.value;
  let body = bodyInput.value;
  let image = imageInput.files[0];

  let formData = new FormData();
  formData.append("body", body);
  formData.append("title", title);
  formData.append("image", image);

  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "multipart/form-data",
    authorization: `Bearer ${token}`,
  };
  // formData.append("_method", "put");
  let URL = `https://tarmeezacademy.com/api/v1/posts/${postId}`;
  axios
    .put(URL, formData, {
      headers: headers,
    })
    .then((response) => {
      const model = document.getElementById("btn_edit_post");
      const modelBootsrap = bootstrap.Modal.getInstance(model);
      modelBootsrap.hide();
      showSuccessAlert("Success edit post");
      titleInput.value = "";
      bodyInput.value = "";
      imageInput.value = "";
      getPost();
    })
    .catch((err) => {
      showSuccessAlert(err, "danger");
      console.log(err);
    });
}
function deletePostClicked(postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));
  console.log(post);
  document.getElementById("is_delete_post_input").value = post.id;
  let deleteModel = new bootstrap.Modal(
    document.getElementById("delete_btn_post"),
    {}
  );
  deleteModel.toggle();
}
function ConfirmDelete() {
  let postId = document.getElementById("is_delete_post_input").value;
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "multipart/form-data",
    authorization: `Bearer ${token}`,
  };

  axios
    .delete(`https://tarmeezacademy.com/api/v1/posts/${postId}`, {
      headers: headers,
    })
    .then((response) => {
      const model = document.getElementById("delete_btn_post");
      const modelBootsrap = bootstrap.Modal.getInstance(model);
      modelBootsrap.hide();
      showSuccessAlert("Success Deleted", "success");
      console.log(response);
      getPost();
    })
    .catch((err) => {
      const msg = err.response.data.message;
      showSuccessAlert(err, "danger");
    });
}
////////// HOME \\\\\\\\\\
async function getPostOne(id) {
  try {
    const response = await axios.get(
      `https://tarmeezacademy.com/api/v1/posts/${id}`
    );
    const post = response.data.data;

    console.log(post);
    console.log(post.id);

    // reset containers
    const postsContainer = document.getElementById("posts");
    const spanName = document.getElementById("spanName");
    postsContainer.innerHTML = "";
    spanName.innerHTML = `${post.author.name}'s`;

    // --- profile image
    let imageUrl =
      typeof post.author.profile_image === "string" &&
      post.author.profile_image.trim() !== ""
        ? post.author.profile_image
        : post.author.profile_image?.url || "assets/profile_pic/nature-4.jpg";

    // --- main post image
    let image =
      typeof post.image === "string" && post.image.trim() !== ""
        ? post.image
        : post.image?.url || "assets/profile_pic/nature-4.jpg";

    // --- comments images
    const commentsWithUrls = post.comments.map((comment) => {
      const imgUrl =
        typeof comment.author.profile_image === "string" &&
        comment.author.profile_image.trim() !== ""
          ? comment.author.profile_image
          : comment.author.profile_image?.url ||
            "assets/profile_pic/nature-4.jpg";

      return { ...comment, imgUrl };
    });

    // ✅ check all images in parallel
    const [profileOk, ...commentsOk] = await Promise.all([
      checkImage(imageUrl),
      ...commentsWithUrls.map((c) => checkImage(c.imgUrl)),
    ]);

    const profileImg = profileOk ? imageUrl : "assets/profile_pic/nature-4.jpg";

    const commentsContent = commentsWithUrls
      .map((comment, i) => {
        const imageComment = commentsOk[i]
          ? comment.imgUrl
          : "assets/profile_pic/nature-4.jpg";
        return `
            <div class="p-3" style="background-color: rgb(187, 187, 187);">
                <div>
                <img src="${imageComment}" class="rounded-circle" style="width: 40px; height: 40px;">
                <b>${comment.author.username}</b>
                </div>
                <div>${comment.body}</div>
            </div>`;
      })
      .join("");

    // --- check if user is logged in
    const token = localStorage.getItem("token");
    const addCommentDiv = token
      ? `<div class="input_group d-flex mb-1 mt-2 p-1" id="add_comment_div">
                <input type="text" id="input_comment" class="form-control" placeholder="add your comment here...">
                <button id="btn_create_comment" class="btn btn-outline-primary" type="button" onclick="createCommentClicked(${post.id})" >Send</button>
            </div>`
      : "";

    // --- main post content
    const content = `
            <div class="card shadow-sm mb-3">
                <div class="card-header">
                <img src="${profileImg}" style="width: 45px; height: 45px;" class="img-thumbnail rounded-circle">
                <b>${post.author.username || "@Ahmed Hossam"}</b>
                </div>
                <div class="card-body" onclick="postClicked(${post.id})">
                <img src="${image}" class="w-100" style="height: 300px; object-fit: cover;">
                <p class="text-secondary">${post.created_at}</p>
                <h5 class="card-title">${
                  post.title || "Special title treatment"
                }</h5>
                <p class="card-text">${
                  post.body ||
                  "With supporting text below as a natural lead-in to additional content."
                }</p>
                <hr>
                <div class="d-flex">
                    <i class="bi bi-pen mx-1"></i>
                    <span>(${post.comments_count}) comments 
                    <span id="post-tags-${post.id}"></span>
                    </span>
                </div>
                </div>
                <div id="comments-${post.id}">${commentsContent}</div>
                ${addCommentDiv}
            </div>`;

    postsContainer.innerHTML = content;

    // --- render tags
    const tagsContainer = document.getElementById(`post-tags-${post.id}`);
    tagsContainer.innerHTML = post.tags
      .map(
        (tag) =>
          `<button class="btn btn-sm rounded-5" style="background-color: gray; color: white">${tag.name}</button>`
      )
      .join("");
  } catch (error) {
    console.error(error);
  }
}
window.createCommentClicked = function (id) {
  console.log(id);
  const input = document.getElementById("input_comment");
  const commentBody = input.value;

  let params = {
    body: commentBody,
  };

  let token = localStorage.getItem("token");

  axios
    .post(`https://tarmeezacademy.com/api/v1/posts/${id}/comments`, params, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      getPostOne(id);
      console.log(response);
    })
    .catch((err) => {
      showSuccessAlert(err, "danger");
    });

  input.value = "";
};
////////// DETEILS \\\\\\\\\\
function getUser(id) {
  console.log(id);
  axios
    .get(`https://tarmeezacademy.com/api/v1/users/${id}`)
    .then((response) => {
      let user = response.data.data;
      console.log(user);

      document.getElementById("email_info").innerHTML =
        user.email !== null ? user.email : "Empty";
      document.getElementById("name_info").innerHTML = user.name;
      document.getElementById("username_info").innerHTML = user.username;
      document.getElementById("post_info").innerHTML = user.posts_count;
      document.getElementById("comm_info").innerHTML = user.comments_count;
      document.getElementById("title_name_info").innerHTML = user.name;

      let imageUrlProfile =
        typeof user.profile_image === "string"
          ? user.profile_image
          : user.profile_image?.url || "assets/profile_pic/nature-4.jpg";
      const profileImg = checkImage(imageUrlProfile)
        ? imageUrlProfile
        : "assets/profile_pic/nature-4.jpg";

      document.getElementById("img_info").src = profileImg;
    });
}
async function getPostInfo() {
  try {
    const response = await axios.get(
      `https://tarmeezacademy.com/api/v1/users/${id}/posts`
    );

    const posts = response.data.data;
    document.getElementById("user_posts").innerHTML = "";

    console.log(posts);
    console.log("-------");
    // return;

    const postsHtml = await Promise.all(
      posts.map(async (post) => {
        const user = getCurrentUser();

        const isMyPost = user && post.author.id === user.id;

        const editBtnContent = isMyPost
          ? `
              <button id="edit_post_btn" class="btn btn-secondary" style="float:right;"
                onclick="editPostBtnClicked('${encodeURIComponent(
                  JSON.stringify(post)
                )}')">
                edit
              </button>

              <button id="btn_delete_post" class="btn btn-danger me-1" style="float:right;"
                onclick="deletePostClickedInfo('${encodeURIComponent(
                  JSON.stringify(post)
                )}')">
                delete
              </button>`
          : "";

        // profile image
        let imageUrlProfile =
          typeof post.author.profile_image === "string"
            ? post.author.profile_image
            : post.author.profile_image?.url ||
              "assets/profile_pic/nature-4.jpg";
        // post image
        let imageUrlPost =
          typeof post.image === "string"
            ? post.image
            : post.image?.url || "assets/profile_pic/nature-4.jpg";

        const profileImg = (await checkImage(imageUrlProfile))
          ? imageUrlProfile
          : "assets/profile_pic/nature-4.jpg";
        const postImage = (await checkImage(imageUrlPost))
          ? imageUrlPost
          : "assets/profile_pic/nature-4.jpg";

        const username = post.author.username || "@Ahmed Hossam";
        const title = post.title || "Special title treatment";
        const body =
          post.body !== "---" && post.body !== "--"
            ? post.body
            : "With supporting text below as a natural lead-in to additional content.";

        const tagsHtml = post.tags
          .map(
            (tag) => `<span class="badge bg-secondary mx-1">${tag.name}</span>`
          )
          .join("");

        return `
          <div class="card shadow-sm mb-3">
              <div class="card-header">
                  <img src="${profileImg}" alt="image" style="width: 45px; height: 45px;"
                      class="img-thumbnail rounded-circle">
                  <b>${username}</b>
                  ${editBtnContent}
              </div>
              <div class="card-body" onclick="postClicked(${post.id})">
                  <img src="${postImage}" alt="image" class="w-100"
                      style="height: 300px; object-fit: cover;">
                  <p class="text-secondary">${post.created_at}</p>
                  <h5 class="card-title">${title}</h5>
                  <p class="card-text">${body}</p>
                  <hr>
                  <div class="d-flex">
                      <i class="bi bi-pen mx-1"></i>
                      <span>(${post.comments_count}) comments</span>
                      <span id="post-tags-${post.id}">${tagsHtml}</span>
                  </div>
              </div>
          </div>`;
      })
    );

    document.getElementById("user_posts").innerHTML += postsHtml.join("");
  } catch (error) {
    console.error(error);
    showSuccessAlert(err, "danger");
  }
}
function deletePostClickedInfo(postObject) {
  let post = JSON.parse(decodeURIComponent(postObject));
  console.log(post);
  console.log("post");
  document.getElementById("is_delete_post_input").value = post.id;
  let deleteModel = new bootstrap.Modal(
    document.getElementById("delete_btn_post"),
    {}
  );
  deleteModel.toggle();
}
function ConfirmDeleteInfo() {
  let postId = document.getElementById("is_delete_post_input").value;
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "multipart/form-data",
    authorization: `Bearer ${token}`,
  };

  axios
    .delete(`https://tarmeezacademy.com/api/v1/posts/${postId}`, {
      headers: headers,
    })
    .then((response) => {
      const model = document.getElementById("delete_btn_post");
      const modelBootsrap = bootstrap.Modal.getInstance(model);
      modelBootsrap.hide();
      showSuccessAlert("Success Deleted", "success");
      console.log(response);
      getPostInfo();
    })
    .catch((err) => {
      const msg = err.response.data.message;
      showSuccessAlert(msg, "danger");
    });
}
function toggleLoader(show = true) {
  if (show) {
    document.getElementById("loader").style.visibility = "visible";
  } else {
    document.getElementById("loader").style.visibility = "hidden";
  }
}
