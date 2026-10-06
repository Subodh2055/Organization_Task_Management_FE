import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {ToastService} from "../ToastService";
import {Alert, AlertType} from "../Alert";
import {AuthService} from "../core/auth.service";

@Component({
  selector: 'app-login',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  addForm: FormGroup
  submitted: boolean = false
  loading: boolean = false

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private route: Router,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    this.formMaker();
  }

  addLogin() {
    this.submitted = true
    if (this.addForm.invalid || this.loading) {
      return;
    }
    this.loading = true;
    const {username, password} = this.addForm.value;
    this.authService.login(username, password).subscribe(
      response => {
        this.loading = false;
        this.toastService.show(new Alert(AlertType.SUCCESS, `Welcome, ${response.user.fullName}`));
        this.route.navigateByUrl(this.authService.homeUrl());
      },
      error => {
        this.loading = false;
        this.toastService.show(new Alert(AlertType.ERROR, 'Invalid username or password'));
      });
  }

  get addFormControl(): { [key: string]: AbstractControl } {
    return this.addForm.controls;
  }

  private formMaker() {
    this.addForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
    })

  }

}
