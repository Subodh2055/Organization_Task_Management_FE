import {Component, Input, OnInit} from '@angular/core';
import {RequestClarification} from "./RequestClarification";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {RequestclarificationService} from "./requestclarification.service";
import {Router, Routes} from "@angular/router";
import {ObjectUtil} from "../ObjectUtil";

@Component({
  selector: 'app-request-clarification',
  templateUrl: './request-clarification.component.html',
  styleUrls: ['./request-clarification.component.scss']
})
export class RequestClarificationComponent implements OnInit {
  submitted: boolean = false
  requestClarification: RequestClarification;
  requestClarifications: RequestClarification;
  requestClarificationData: any;
  @Input() formValue: RequestClarification;
  addForm: FormGroup;
  userData: any;


  constructor(
    private requestClarificationService: RequestclarificationService,
    private formBuilder: FormBuilder,
    private route: Router
  ) {
  }

  ngOnInit(): void {
    this.formMaker();
    if (!ObjectUtil.isEmpty(this.formValue)) {
      this.requestClarification = this.formValue;
      this.formMaker();
    }
    this.getUserData();
  }

  private formMaker() {
    this.addForm = this.formBuilder.group({
      subject: [undefined, Validators.required],
      clarificationRequested: [undefined, Validators.required],
      module: [undefined, Validators.required],
      requestedBy: [undefined],
      requestedTo: [undefined],
      expectedDateForClosure: [undefined],
      emailReference: [undefined, Validators.compose([Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")])],
    })
  }


  addRequestClarification() {
    this.submitted = true;
    if (this.addForm.invalid) {
    } else {
      this.requestClarificationService.addRequestClarification(this.addForm.value).subscribe(
        response => {
          console.log(response, 'response')
          this.nextToClarificationTable();
        });
    }
  }

  getUserData() {
    this.requestClarificationService.getUser().subscribe(
      response => {
        this.userData = response;
        console.log(this.userData, 'organization data')

      },
      error => {
        console.log(error)
      }
    )
  }

  get addFormControl(): { [key: string]: AbstractControl } {
    return this.addForm.controls;
  }

  private nextToClarificationTable() {
    this.route.navigate(['clarification-list'])
  }
}


