/**
 * @typedef {Object} TravelTask
 * @property {string} title
 * @property {string} description
 * @property {'Vuelos'|'Hospedaje'|'Documentos'|'Reservaciones'|'Pagos'|'Transporte'|'Actividades'|'Otros'} category
 * @property {'Baja'|'Media'|'Alta'} priority
 * @property {string|null} dueDate ISO local date; null means no deadline.
 * @property {boolean} completed
 * @property {string|null} assignee
 * @property {string} createdBy Firebase uid.
 * @property {{enabled:boolean,sentAt:null}} notification Reserved for future delivery.
 */

/**
 * @typedef {Object} PackingItem
 * @property {string} name
 * @property {'Ropa'|'Higiene'|'Tecnología'|'Documentos'|'Medicamentos'|'Accesorios'|'Otros'} category
 * @property {number} quantity Integer from 1 to 99.
 * @property {boolean} packed
 * @property {string|null} assignee
 * @property {string} notes
 * @property {string} createdBy Firebase uid.
 */

export {};
