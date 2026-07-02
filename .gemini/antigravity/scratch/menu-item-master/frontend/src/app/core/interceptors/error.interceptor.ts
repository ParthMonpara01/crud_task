import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { PopupService } from '../services/popup.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  const popupService = inject(PopupService);

 

  return next(req).pipe(

    catchError((error: HttpErrorResponse) => {

      console.log('Interceptor Error:', error);

     

      return throwError(() => error);

    })

  );

};