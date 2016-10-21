import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, FormBuilder } from '@angular/forms';
import { BrowserModule  } from '@angular/platform-browser';
import { HomePage }   from './todo/components/homePage';
import { TodoService }   from './todo/services/todo-service';

@NgModule({
    imports: [
      BrowserModule,
      FormsModule,
      HttpModule,
    ],
   declarations: [
      HomePage,
    ],
    providers: [
      TodoService,
    ],
    bootstrap: [
      HomePage,
    ],
})
export class AppModule {}
