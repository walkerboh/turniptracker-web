import { ofType } from "redux-observable";
import { of, EMPTY } from "rxjs";
import { switchMap, map, catchError, tap, switchMapTo } from "rxjs/operators";
import {
  LOGIN,
  loginSuccessAction,
  loginErrorAction,
  REGISTER,
  registerSuccessAction,
  registerErrorAction,
  LOGOUT,
  FETCH_TIMEZONES,
  fetchTimezonesSuccessAction,
  fetchTimezonesErrorAction,
} from "actions/users.actions";

export const loginEpic = (action$, _, { ajax, config }) =>
  action$.pipe(
    ofType(LOGIN),
    switchMap(({ payload }) => {
      return ajax({
        url: `${config.API_URL}/users/authenticate`,
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
        },
      }).pipe(
        map(({ response }) => {
          localStorage.setItem("user", JSON.stringify(response));
          localStorage.setItem("token", response.token);
          return loginSuccessAction(response);
        }),
        catchError((err) => of(loginErrorAction(err)))
      );
    })
  );

export const registerEpic = (action$, _, { ajax, config }) =>
  action$.pipe(
    ofType(REGISTER),
    switchMap(({ payload }) => {
      return ajax({
        url: `${config.API_URL}/users/register`,
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
        },
      }).pipe(
        map(({ response }) => registerSuccessAction(response)),
        catchError((err) => of(registerErrorAction(err)))
      );
    })
  );

export const logoutEpic = (action$) =>
  action$.pipe(
    ofType(LOGOUT),
    tap(() => localStorage.removeItem("user")),
    switchMapTo(EMPTY)
  );

export const fetchTimezonesEpic = (action$, _, { ajax, config }) =>
  action$.pipe(
    ofType(FETCH_TIMEZONES),
    switchMap(() => {
      return ajax({
        url: `${config.API_URL}/users/timezones`,
        method: "GET",
      }).pipe(
        map(({ response }) => fetchTimezonesSuccessAction(response)),
        catchError((err) => of(fetchTimezonesErrorAction(err)))
      );
    })
  );
