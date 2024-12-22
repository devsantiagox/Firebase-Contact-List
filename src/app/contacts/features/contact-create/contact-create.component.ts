import { Component, Input, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IconRocket } from '../../../shared/ui/icons/rocket';
import { IconBack } from '../../../shared/ui/icons/back';
import { ContactsService } from '../../data-access/contacts.service';
import { ContactForm } from '../../shared/interfaces/contacts.interface';

export interface CreateForm {
  fullName: FormControl<string>;
  email: FormControl<string>;
  phoneNumber: FormControl<string>;
  description?: FormControl<string | undefined>;
}

@Component({
  selector: 'app-contact-create',
  template: `
    <div class="px-4 xl:px-0 w-full max-w-[600px] m-auto">
      <form [formGroup]="form" (ngSubmit)="createOrUpdateContact()">
        <div class="mb-8">
          <label for="first_name" class="block mb-2 text-sm font-medium"
            >Nombre Completo</label
          >
          <input
            type="text"
            id="first_name"
            class="w-full p-3 rounded-md text-sm bg-transparent border-gray-500 border"
            placeholder="John Doe"
            formControlName="fullName"
          />
          <div
            *ngIf="
              form.get('fullName')?.invalid &&
              (form.get('fullName')?.dirty || form.get('fullName')?.touched)
            "
            class="text-red-500 text-sm"
          >
            Nombre Completo es requerido.
          </div>
        </div>
        <div class="mb-8">
          <label for="email" class="block mb-2 text-sm font-medium"
            >Correo Electrónico</label
          >
          <input
            type="email"
            id="email"
            class="w-full p-3 rounded-md text-sm bg-transparent border-gray-500 border"
            placeholder="example@mail.com"
            formControlName="email"
          />
          <div
            *ngIf="
              form.get('email')?.invalid &&
              (form.get('email')?.dirty || form.get('email')?.touched)
            "
            class="text-red-500 text-sm"
          >
            Correo Electrónico es requerido y debe ser válido.
          </div>
        </div>
        <div class="mb-8">
          <label for="phoneNumber" class="block mb-2 text-sm font-medium"
            >Teléfono</label
          >
          <input
            type="text"
            id="phoneNumber"
            class="w-full p-3 rounded-md text-sm bg-transparent border-gray-500 border"
            placeholder="+57 314565789"
            formControlName="phoneNumber"
          />
          <div
            *ngIf="
              form.get('phoneNumber')?.invalid &&
              (form.get('phoneNumber')?.dirty ||
                form.get('phoneNumber')?.touched)
            "
            class="text-red-500 text-sm"
          >
            Teléfono es requerido.
          </div>
        </div>
        <div class="mb-8">
          <label for="description" class="block mb-2 text-sm font-medium"
            >Descripción (opcional)</label
          >
          <textarea
            rows="5"
            type="text"
            id="description"
            class="w-full p-3 rounded-md text-sm bg-transparent border-gray-500 border"
            placeholder="Tu descripción va aquí."
            formControlName="description"
          ></textarea>
        </div>

        <div class="flex justify-between items-center">
          <a
            class="text-sm flex text-nowrap items-center gap-x-2 hover:text-gray-300 transition-[color] ease-in-out duration-200 p-4 cursor-pointer"
            routerLink="/dashboard"
          >
            <app-icon-back />
            Regresar al dashboard
          </a>

          <button
            class="text-sm flex text-nowrap items-center gap-x-2 hover:text-gray-300 transition-[color] ease-in-out duration-200 p-4 cursor-pointer"
            type="submit"
          >
            <app-icon-rocket />
            {{ contactId ? 'Editar tu contacto' : 'Crear tu contacto' }}
          </button>
        </div>
      </form>
    </div>
  `,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IconRocket,
    IconBack,
    RouterLink,
    CommonModule,
  ],
})
export default class ContactCreateComponent implements OnInit {
  private _formBuilder = inject(FormBuilder).nonNullable;
  private _router = inject(Router);
  private _contactsService = inject(ContactsService);
  private _route = inject(ActivatedRoute);

  private _contactId = '';

  get contactId(): string {
    return this._contactId;
  }

  @Input() set contactId(value: string) {
    this._contactId = value;
    this.setFormValues(this._contactId);
  }

  form = this._formBuilder.group<CreateForm>({
    fullName: this._formBuilder.control('', Validators.required),
    email: this._formBuilder.control('', [
      Validators.required,
      Validators.email,
    ]),
    phoneNumber: this._formBuilder.control('', Validators.required),
    description: this._formBuilder.control(''),
  });

  ngOnInit(): void {
    this._route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.contactId = id;
        this.form.get('fullName')?.setValidators([Validators.required]);
        this.form
          .get('email')
          ?.setValidators([Validators.required, Validators.email]);
        this.form.get('phoneNumber')?.setValidators([Validators.required]);
        this.form.updateValueAndValidity();
      }
    });
  }

  async createOrUpdateContact() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    if (this.form.invalid) return;

    try {
      const contact = this.form.value as ContactForm;
      if (!this.contactId) {
        await this._contactsService.createContact(contact);
      } else {
        await this._contactsService.updateContact(this.contactId, contact);
      }
      this._router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error creating or updating contact', error);
    }
  }

  async setFormValues(id: string) {
    try {
      const contact = await this._contactsService.getContact(id);
      if (!contact) return;
      this.form.setValue({
        fullName: contact.fullName,
        email: contact.email,
        phoneNumber: contact.phoneNumber,
        description: contact.description,
      });
      this.form.updateValueAndValidity();
    } catch (error) {
      console.error('Error fetching contact', error);
    }
  }
}
