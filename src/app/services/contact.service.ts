import { isPlatformBrowser } from '@angular/common';
import { Contact, CreateContactDto } from '../models/contact.interface';
import { Injectable,signal, computed, PLATFORM_ID, inject } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly STORAGE_KEY = 'contacts';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  
  private contactsSignal = signal<Contact[]>([]);
  public contacts = this.contactsSignal.asReadonly();
  public contactCount = computed(() => this.contactsSignal().length);
  
  constructor() {
    this.loadContacts();
  }

  /**
   * Carga los contactos desde localStorage.
   * 
   * Si no hay contactos guardados, inicializa con un array vacío.
   * 
   * Maneja errores de conversión y asegura que las fechas se conviertan correctamente.
   */
  private loadContacts(): void {
    // Solo intentar cargar desde localStorage si estamos en el navegador
    if (!this.isBrowser) {
      return;
    }
    
    try {
      const storedContacts = localStorage.getItem(this.STORAGE_KEY);
      if (storedContacts) {
        const contacts = JSON.parse(storedContacts);
        // Convertir strings de fecha de vuelta a objetos Date
        const contactsWithDates = contacts.map((contact: any) => ({
          ...contact,
          createdAt: new Date(contact.createdAt)
        }));
        this.contactsSignal.set(contactsWithDates);
      }
    } catch (error) {
      console.error('Error loading contacts from localStorage:', error);
    }
  }

  /**
   * Guarda los contactos en localStorage.
   * 
   * Si ocurre un error al guardar, lo registra en la consola.
   * 
   * Solo intenta guardar si estamos en el navegador para evitar errores en el servidor.
   */
  private saveContacts(): void {
    // Solo intentar guardar en localStorage si estamos en el navegador
    if (!this.isBrowser) {
      return;
    }
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.contactsSignal()));
    } catch (error) {
      console.error('Error saving contacts to localStorage:', error);
    }
  }

  /**
   * Genera un ID único para un nuevo contacto.
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Agrega un nuevo contacto
   * @param contactData Datos del contacto a agregar
   * @returns El contacto agregado con su ID y fecha de creación
   * 
   * Utiliza un ID único generado y establece la fecha de creación al momento actual.
   * Actualiza el estado de los contactos y guarda los cambios en localStorage.
   */
  addContact(contactData: CreateContactDto): Contact {
    const newContact: Contact = {
      id: this.generateId(),
      ...contactData,
      createdAt: new Date()
    };

    const currentContacts = this.contactsSignal();
    this.contactsSignal.set([...currentContacts, newContact]);
    this.saveContacts();
    
    return newContact;
  }

  /**
   * Elimina un contacto por ID
   * @param id ID del contacto a eliminar
   * @returns true si el contacto fue eliminado, false si no se encontró
   * 
   * Filtra los contactos para eliminar el que coincide con el ID proporcionado.
   * Actualiza el estado de los contactos y guarda los cambios en localStorage.
   */
  deleteContact(id: string): boolean {
    const currentContacts = this.contactsSignal();
    const filteredContacts = currentContacts.filter(contact => contact.id !== id);
    
    if (filteredContacts.length !== currentContacts.length) {
      this.contactsSignal.set(filteredContacts);
      this.saveContacts();
      return true;
    }
    
    return false;
  }

  /**
   * Busca contactos por nombre (ignora mayúsculas y minúsculas), email o teléfono
   * @param searchTerm Término de búsqueda
   * @returns Lista de contactos que coinciden con el término de búsqueda
   * 
   * Filtra los contactos por nombre, email o teléfono, ignorando mayúsculas y minúsculas.
   * Si el término de búsqueda está vacío, devuelve todos los contactos.
   */
  searchContacts(searchTerm: string): Contact[] {
    if (!searchTerm.trim()) {
      return this.contactsSignal();
    }
    
    const term = searchTerm.toLowerCase();
    return this.contactsSignal().filter(contact =>
      contact.name.toLowerCase().includes(term) ||
      contact.email.toLowerCase().includes(term) ||
      contact.phone.includes(term)
    );
  }

  /**
   * Obtiene un contacto por ID
   * @param id ID del contacto a buscar
   * @returns El contacto encontrado o undefined si no se encuentra
   * 
   * Busca un contacto por su ID y devuelve el contacto correspondiente.
   * Si no se encuentra, devuelve undefined.
   */
  getContactById(id: string): Contact | undefined {
    return this.contactsSignal().find(contact => contact.id === id);
  }

  /**
   * Actualiza un contacto existente
   * @param id ID del contacto a actualizar
   * @param contactData Datos a actualizar (parciales)
   * @returns El contacto actualizado o null si no se encuentra
   */
  updateContact(id: string, contactData: Partial<CreateContactDto>): Contact | null {
    const currentContacts = this.contactsSignal();
    const contactIndex = currentContacts.findIndex(contact => contact.id === id);
    
    if (contactIndex === -1) {
      return null;
    }
    
    const updatedContact = {
      ...currentContacts[contactIndex],
      ...contactData
    };
    
    const updatedContacts = [...currentContacts];
    updatedContacts[contactIndex] = updatedContact;
    
    this.contactsSignal.set(updatedContacts);
    this.saveContacts();
    
    return updatedContact;
  }

  /**
   * Limpia todos los contactos guardados
   * 
   * Elimina todos los contactos del estado y del localStorage.
   */
  clearAllContacts(): void {
    this.contactsSignal.set([]);
    this.saveContacts();
  }
}
