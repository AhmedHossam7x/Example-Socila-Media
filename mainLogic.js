//==========================\\

//// ==== \\\\

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
      // نتاكد إن فيه response قبل ما نوصل للـ data
      const msg =
        err.response?.data?.message || err.message || "Unexpected error";
      showSuccessAlert(msg, "danger");
      console.error(err);
    });
}
