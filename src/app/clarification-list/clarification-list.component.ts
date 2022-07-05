import {Component, Input, OnInit} from '@angular/core';
import {RequestclarificationService} from "../request-clarification/requestclarification.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {RequestClarification} from "../request-clarification/RequestClarification";
import {ObjectUtil} from "../ObjectUtil";

@Component({
  selector: 'app-clarification-list',
  templateUrl: './clarification-list.component.html',
  styleUrls: ['./clarification-list.component.scss']
})
export class ClarificationListComponent implements OnInit {
  p: number = 1
  clarificationData: any
  clarificationForm: FormGroup
  @Input() formValue: RequestClarification;
  clarification = new RequestClarification
  constructor(private clarificationService: RequestclarificationService,
              private modalService: NgbModal,
              private formBuilder: FormBuilder) { }


  ngOnInit(): void {

    this.formMaker();
    if(!ObjectUtil.isEmpty(this.formValue)){
      this.clarification = this.formValue;
      this.formMaker();
    }
    this.getAllClarification();
  }


  getAllClarification() {
    this.clarificationService.getRequestClarification().subscribe(response => {
      this.clarificationData = response;
    });
  }

  formMaker() {
    this.clarificationForm = this.formBuilder.group({
      id: [undefined],
      clarifiedDate: [undefined],
      clarificationProvidedBy: [undefined],
      provideClarification: [undefined],
      emailReference: [undefined],
      expectedDateForClosure: [undefined],
      requestedDate: [undefined],
      requestedTo: [undefined],
      requestedBy: [undefined],
      module: [undefined],
      clarificationRequested: [undefined],
      subject: [undefined],

    })
  }

  onSubmit() {
    this.clarification.id = this.clarificationForm.get('id')?.value;
    this.clarification.clarificationProvidedBy = this.clarificationForm.get('clarificationProvidedBy')?.value;
    this.clarification.clarifiedDate = this.clarificationForm.get('clarifiedDate')?.value;
    this.clarification.clarificationRequested = this.clarificationForm.get('clarificationRequested')?.value;
    this.clarification.provideClarification = this.clarificationForm.get('provideClarification')?.value;
    this.clarification.emailReference = this.clarificationForm.get('emailReference')?.value;
    this.clarification.requestedBy = this.clarificationForm.get('requestedBy')?.value;
    this.clarification.requestedTo = this.clarificationForm.get('requestedTo')?.value;
    this.clarification.expectedDateForClosure = this.clarificationForm.get('expectedDateForClosure')?.value;
    this.clarification.requestedDate = this.clarificationForm.get('requestedDate')?.value;
    this.clarification.module = this.clarificationForm.get('module')?.value;
    this.clarification.subject = this.clarificationForm.get('subject')?.value;
  }


  open(template: any, id: number) {
    this.modalService.open(template);
    this.clarificationService.getRequestClarificationById(id).subscribe(response => {
      this.clarificationForm = new  FormGroup<any>({
        id: new FormControl(response['id']),
        module: new  FormControl(response['module']),
        clarificationProvidedBy: new  FormControl(response['clarificationProvidedBy']),
        clarifiedDate: new  FormControl(response['clarifiedDate']),
        clarificationRequested: new  FormControl(response['clarificationRequested']),
        provideClarification: new  FormControl(response['provideClarification']),
        emailReference: new  FormControl(response['emailReference']),
        requestedBy: new  FormControl(response['requestedBy']),
        requestedTo: new  FormControl(response['requestedTo']),
        expectedDateForClosure: new  FormControl(response['expectedDateForClosure']),
        requestedDate: new  FormControl(response['requestedDate']),
        subject: new FormControl(response['subject'])
      })
    })
  }

  updateClarification(id: any) {
    this.clarificationService.updateClarification( this.clarificationForm.value, id).subscribe(response => {
    this.modalService.dismissAll();
    this.getAllClarification();
    })
  }
}
