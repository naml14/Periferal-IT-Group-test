import { CommonModule } from '@angular/common';
import { Component, signal, output } from '@angular/core';
import { CreateContactDto } from '../../models/contact.interface';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css',
})
export class ContactForm {
  // Signals para el estado del componente
  isSubmitting = signal(false);
  isEditing = signal(false);

  // Output
  contactSubmitted = output<CreateContactDto>();
  editCancelled = output<void>();

  // Getters
  get nameControl() {
    return this.contactForm.get('name')!;
  }
  get emailControl() {
    return this.contactForm.get('email')!;
  }
  get phoneControl() {
    return this.contactForm.get('phone')!;
  }

  // Formulario
  contactForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]),
  });

  // Manejo
  async onSubmit(): Promise<void> {
    if (this.contactForm.valid) {
      this.isSubmitting.set(true);

      // Simular un pequeño delay para mostrar el estado de carga
      await new Promise((resolve) => setTimeout(resolve, 500));

      const contactData = this.contactForm.value as CreateContactDto;
      this.contactSubmitted.emit(contactData);

      if (!this.isEditing()) {
        this.onReset();
      }

      this.isSubmitting.set(false);
    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.contactForm.markAllAsTouched();
    }
  }

  // reset
  onReset(): void {
    this.contactForm.reset();
    this.contactForm.markAsUntouched();
  }

  // Cancelar edición
  onCancel(): void {
    this.editCancelled.emit();
    this.isEditing.set(false);
    this.onReset();
  }

  // Coloca los datos para la edición
  setEditData(contact: CreateContactDto): void {
    this.isEditing.set(true);
    this.contactForm.patchValue(contact);
  }
}
