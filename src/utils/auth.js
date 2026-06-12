const LOGIN_STATUS_KEY = 'gorse_dashboard_login_status';

let loginStatus = sessionStorage.getItem(LOGIN_STATUS_KEY);
loginStatus = loginStatus === null ? null : loginStatus === 'true';

export function getLoginStatus() {
  return loginStatus;
}

export function setLoginStatus(status) {
  loginStatus = status;
  if (status === null) {
    sessionStorage.removeItem(LOGIN_STATUS_KEY);
  } else {
    sessionStorage.setItem(LOGIN_STATUS_KEY, status ? 'true' : 'false');
  }
}

export function clearLoginStatus() {
  setLoginStatus(false);
}
