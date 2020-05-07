import {
  FETCH_BOARD_LIST,
  fetchBoardListSuccessAction,
  fetchBoardListErrorAction,
  FETCH_BOARD_DETAILS,
  fetchBoardDetailsSuccessAction,
  fetchBoardDetailsErrorAction,
  fetchBoardWeeksSuccessAction,
  fetchBoardWeeksErrorAction,
  FETCH_BOARD_DETAILS_SUCCESS,
  FETCH_BOARD_PRICES,
  fetchBoardPricesSuccessAction,
  fetchBoardPricesErrorAction,
  fetchBoardPricesAction,
  SUBMIT_BUY_PRICE,
  submitBuyPriceSuccessAction,
  submitBuyPriceErrorAction,
  SUBMIT_SELL_PRICE,
  submitSellPriceSuccessAction,
  submitSellPriceErrorAction,
} from "actions/boardData.actions";
import { of } from "rxjs";
import { ofType } from "redux-observable";
import { switchMap, map, catchError, mergeMap } from "rxjs/operators";

export const fetchBoardListEpic = (action$, _, { ajax, config }) =>
  action$.pipe(
    ofType(FETCH_BOARD_LIST),
    switchMap(() => {
      return ajax({
        url: `${config.API_URL}/boards`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
        },
      }).pipe(
        map(({ response }) => fetchBoardListSuccessAction(response)),
        catchError((err) => of(fetchBoardListErrorAction(err)))
      );
    })
  );

export const fetchBoardDetailsEpic = (action$, _, { ajax, config }) =>
  action$.pipe(
    ofType(FETCH_BOARD_DETAILS),
    switchMap(({ payload }) => {
      const url = payload.id
        ? `${config.API_URL}/boards/${payload.id}`
        : `${config.API_URL}/boards/name/${payload.name}`;
      return ajax({
        url,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
        },
      }).pipe(
        map(({ response }) => fetchBoardDetailsSuccessAction(response)),
        catchError((err) => of(fetchBoardDetailsErrorAction(err)))
      );
    })
  );

export const fetchBoardWeeksEpic = (action$, _, { ajax, config }) =>
  action$.pipe(
    ofType(FETCH_BOARD_DETAILS_SUCCESS),
    switchMap(({ payload }) => {
      return ajax({
        url: `${config.API_URL}/boards/${payload.id}/weeks`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
        },
      }).pipe(
        mergeMap(({ response }) => {
          const actions = [fetchBoardWeeksSuccessAction(response)];

          if (response.length) {
            actions.push(
              fetchBoardPricesAction({ id: payload.id, week: response[0] })
            );
          }

          return actions;
        }),
        catchError((err) => of(fetchBoardWeeksErrorAction(err)))
      );
    })
  );

export const fetchBoardPricesEpic = (action$, _, { ajax, config }) =>
  action$.pipe(
    ofType(FETCH_BOARD_PRICES),
    switchMap(({ payload }) => {
      return ajax({
        url: `${config.API_URL}/boards/${payload.id}/prices/${payload.week}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
        },
      }).pipe(
        map(({ response }) => fetchBoardPricesSuccessAction(response)),
        catchError((err) => of(fetchBoardPricesErrorAction(err)))
      );
    })
  );

export const submitBuyPriceEpic = (action$, _, { ajax, config }) =>
  action$.pipe(
    ofType(SUBMIT_BUY_PRICE),
    switchMap(({ payload }) => {
      return ajax({
        url: `${config.API_URL}/boards/${payload.boardId}/users/${payload.userId}/prices/buy`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
          "Content-Type": "application/json",
        },
        body: {
          date: payload.date,
          price: payload.price,
        },
      }).pipe(
        map(({ response }) => submitBuyPriceSuccessAction(response)),
        catchError((err) => of(submitBuyPriceErrorAction(err)))
      );
    })
  );

export const submitSellPriceEpic = (action$, _, { ajax, config }) =>
  action$.pipe(
    ofType(SUBMIT_SELL_PRICE),
    switchMap(({ payload }) => {
      return ajax({
        url: `${config.API_URL}/boards/${payload.boardId}/users/${payload.userId}/prices/sell`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.token}`,
          "Content-Type": "application/json",
        },
        body: {
          date: payload.date,
          price: payload.price,
          day: payload.day,
          period: payload.period,
        },
      }).pipe(
        map(({ response }) => submitSellPriceSuccessAction(response)),
        catchError((err) => of(submitSellPriceErrorAction(err)))
      );
    })
  );
