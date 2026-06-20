const notification = document.createElement("div");
notification.className = "notification";
document.body.appendChild(notification);

let hideTimer = null;

export function showNotification(message) {
    notification.textContent = message;
    notification.classList.add("notification-show");

    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
        notification.classList.remove("notification-show");
    }, 2500);
}