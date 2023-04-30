export function showNotification(message: string, type: string) {
  const notification = document.createElement("div");

  notification.classList.add(
    "fixed",
    "bottom-0",
    "right-0",
    "m-4",
    "p-4",
    "rounded-md",
    "text-secondary",
    "font-semibold",
    "text-base",
    "z-50"
  );

  if (type === "success") {
    notification.classList.add("bg-green-200");
  } else if (type === "error") {
    notification.classList.add("bg-red-200");
  } else {
    notification.classList.add("bg-gray-200");
  }

  const text = document.createTextNode(message);
  notification.appendChild(text);

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}
