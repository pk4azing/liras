import {
  Component,
  OnInit,
  Pipe,
  PipeTransform,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { BrowserModule } from '@angular/platform-browser';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { InternationalPhonePipe } from '../../utilities/international-phone.pipe';
import { CdClientActivityComponent } from '../cd-client-activity/cd-client-activity.component';
import { CdClientActivityUploadComponent } from '../cd-client-activity-upload/cd-client-activity-upload.component';
import { parsePhoneNumber } from '../../utilities/phone-utils';
import { CdModeDirectiveDirective } from '../../cd-directives/cd-mode-directive/cd-mode-directive.directive';
import { CdClientListServiceService } from '../../cd-services/cd-client-list-service/cd-client-list-service.service';

interface Client {
  id: string;
  name: string;
  startDate: Date;
  lastActivity: number;
  filesUploaded: number;
  expiryDate: Date;
  email: string;
  address: string;
  isEditingEmail?: boolean;
  isEditingAddress?: boolean;
  tempEmail?: string;
  tempAddress?: string;
  isEditingName?: boolean;
  tempName?: string;
  phone: string;
  isEditingPhone?: boolean;
  tempPhone?: string;
  joinedDate: Date;
  domainName: string;
}

@Component({
  selector: 'app-cd-client-list-component',
  imports: [
    CommonModule,
    MatExpansionModule,
    MatTabsModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
    NgxIntlTelInputModule,
    ReactiveFormsModule,
    CdClientActivityComponent,
    CdClientActivityUploadComponent,
    InternationalPhonePipe,
    CdModeDirectiveDirective,
  ],
  templateUrl: './cd-client-list-component.component.html',
  styleUrl: './cd-client-list-component.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CdClientListComponentComponent implements OnInit {
  preferredCountries = [
    CountryISO.India,
    CountryISO.UnitedStates,
    CountryISO.UnitedKingdom,
  ];
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  clientForms: { [id: string]: FormGroup } = {};

  allClients: Client[] = [];

  filteredClients: Client[] = [...this.allClients];
  searchTerm: string = '';
  iniFileSelected: boolean = false;
  txtFileSelected: boolean = false;

  constructor(
    private fb: FormBuilder,
    private clientService: CdClientListServiceService
  ) {
    this.clientForms = {}; // Initialize the object to store client-specific FormGroups
  }

  ngOnInit(): void {
    const allClients = this.clientService.getClients();

    this.allClients = allClients;
    this.filteredClients = [...allClients];

    // Build form group for each client
    this.allClients.forEach((client) => {
      this.clientForms[client.id] = this.fb.group({
        phone: [client.phone, Validators.required],
      });
    });
  }

  onSearch(event: Event): void {
    event.preventDefault();
    const searchValue = this.searchTerm.trim().toLowerCase();

    if (!searchValue) {
      this.filteredClients = [...this.allClients];
      return;
    }

    this.filteredClients = this.allClients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchValue) ||
        client.id.toLowerCase().includes(searchValue) // <-- FIXED: partial match + lowercase
    );

    this.filteredClients = this.allClients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchValue) ||
        client.id.toLowerCase().includes(searchValue) ||
        client.email.toLowerCase().includes(searchValue) ||
        client.domainName.toLowerCase().includes(searchValue)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredClients = [...this.allClients];
  }

  enableNameEditing(client: Client): void {
    client.isEditingName = true;
    client.tempName = client.name;
  }

  enableEmailEditing(client: Client): void {
    client.isEditingEmail = true;
    client.tempEmail = client.email;
  }

  enableAddressEditing(client: Client): void {
    client.isEditingAddress = true;
    client.tempAddress = client.address;
  }
  enablePhoneEditing(client: any): void {
    client.isEditingPhone = true;

    const parsedPhone = parsePhoneNumber(client.phone);

    this.clientForms[client.id] = this.fb.group({
      phone: [
        parsedPhone
          ? {
              number: parsedPhone.number, // just the national part
              internationalNumber: parsedPhone.internationalNumber,
              e164Number: parsedPhone.e164Number,
              countryCode: parsedPhone.countryCode.toUpperCase(), // ngx-intl-tel-input needs ISO2 in uppercase
              dialCode: parsedPhone.dialCode,
            }
          : client.phone,
        Validators.required,
      ],
    });
  }

  cancelNameEditing(client: Client): void {
    client.isEditingName = false;
    client.tempName = '';
  }

  cancelPhoneEditing(client: any): void {
    client.isEditingPhone = false;
    delete this.clientForms[client.id];
  }

  cancelEmailEditing(client: Client): void {
    client.isEditingEmail = false;
    client.tempEmail = '';
  }

  cancelAddressEditing(client: Client): void {
    client.isEditingAddress = false;
    client.tempAddress = '';
  }

  saveEmail(client: Client): void {
    if (client.tempEmail) {
      this.clientService.updateClient({
        id: client.id,
        email: client.tempEmail,
      });
      client.email = client.tempEmail;
    }
    client.isEditingEmail = false;
    client.tempEmail = '';
  }

  saveName(client: Client): void {
    if (client.tempName) {
      this.clientService.updateClient({
        id: client.id,
        name: client.tempName,
      });
      client.name = client.tempName;
    }
    client.isEditingName = false;
    client.tempName = '';
  }

  savePhone(client: Client): void {
    const phoneControl = this.clientForms[client.id].get('phone');
    if (phoneControl?.valid) {
      const phoneValue = phoneControl.value;
      const phoneString =
        typeof phoneValue === 'string'
          ? phoneValue
          : phoneValue.internationalNumber;
      this.clientService.updateClient({
        id: client.id,
        phone: phoneString,
      });
      client.phone = phoneString;
      client.isEditingPhone = false;
    } else {
      phoneControl?.markAsTouched();
    }
  }

  saveAddress(client: Client): void {
    if (client.tempAddress) {
      this.clientService.updateClient({
        id: client.id,
        address: client.tempAddress,
      });
      client.address = client.tempAddress;
    }
    client.isEditingAddress = false;
    client.tempAddress = '';
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log('Selected file:', file);
      // You can add further processing here, like uploading the file
    }
  }

  onIniFileSelected(event: any) {
    this.iniFileSelected = true;
  }

  onTxtFileSelected(event: any) {
    this.txtFileSelected = true;
  }

  submitFiles() {
    // Handle file submission here
    console.log('Files submitted!');
  }

  cancelUpload() {
    // Handle upload cancellation here
    console.log('Upload cancelled!');
  }

  addClient(newClient: Client): void {
    this.clientService.addClient(newClient);
    this.allClients = this.clientService.getClients();
    this.filteredClients = [...this.allClients];
  }
}
