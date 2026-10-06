import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {RequestclarificationService} from "./requestclarification.service";
import {Router} from "@angular/router";
import {ToastService} from "../ToastService";
import {Alert, AlertType} from "../Alert";
import {AuthService} from "../core/auth.service";
import {UserService} from "../users/user.service";
import {AppUser} from "../core/auth.models";

/** Staff ask customers and customers ask staff; the server records who asked and when. */
@Component({
  selector: 'app-request-clarification',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './request-clarification.component.html',
  styleUrls: ['./request-clarification.component.scss']
})
export class RequestClarificationComponent implements OnInit {
  submitted: boolean = false
  saving: boolean = false
  addForm: FormGroup;
  userData: AppUser[] = [];
  readonly today = new Date().toISOString().slice(0, 10);

  constructor(
    private requestClarificationService: RequestclarificationService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private route: Router,
    private toastService: ToastService,
    public authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.formMaker();
    this.getUserData();
  }

  /** "customer" for staff, "staff member" for customers. */
  get counterpartLabel(): string {
    return this.authService.role === 'STAFF' ? 'customer' : 'staff member';
  }

  private formMaker() {
    this.addForm = this.formBuilder.group({
      subject: ['', Validators.required],
      clarificationRequested: ['', Validators.required],
      module: ['', Validators.required],
      requestedTo: [null, Validators.required],
      expectedDateForClosure: [''],
      emailReference: ['', Validators.compose([Validators.required, Validators.email])],
    })
  }


  addRequestClarification() {
    this.submitted = true;
    if (this.addForm.invalid || this.saving) {
      return;
    }
    this.saving = true;
    const value = this.addForm.value;
    const request = {
      ...value,
      requestedTo: {id: value.requestedTo},
      expectedDateForClosure: value.expectedDateForClosure || null,
    };
    this.requestClarificationService.addRequestClarification(request).subscribe(
      response => {
        this.saving = false;
        this.toastService.show(new Alert(AlertType.SUCCESS, 'Clarification requested successfully'));
        this.route.navigateByUrl(`${this.authService.homeUrl()}/requests`);
      },
      error => {
        this.saving = false;
        this.toastService.show(new Alert(AlertType.ERROR, typeof error.error === 'string' && error.error ? error.error : 'Failed to request clarification'));
      });
  }

  getUserData() {
    this.userService.getAssignableUsers().subscribe(
      response => {
        this.userData = response;
      },
      error => {
        this.toastService.show(new Alert(AlertType.ERROR, 'Failed to load users'));
      }
    )
  }

  get addFormControl(): { [key: string]: AbstractControl } {
    return this.addForm.controls;
  }

  invalid(name: string): boolean {
    const control = this.addFormControl[name];
    return control.invalid && (control.touched || this.submitted);
  }
}
