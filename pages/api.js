/**
 * Create variants for
 * @param {object} body variant contents
 * @param {func} onSuccess called on success
 * @param {func} onError called on failure
 */
export const postVariants = (body, onSuccess, onError) => {
  fetch("/api/variants", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => {
      if (!res.ok) {
        toggleErrorActive();
      }
      return res.json();
    })
    .then((json) => {
      if (json.error) {
        onError(json.message);
      } else {
        onSuccess();
      }
    });
};
