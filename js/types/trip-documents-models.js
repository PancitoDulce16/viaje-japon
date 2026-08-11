/** @typedef {'Vuelo'|'Hospedaje'|'Transporte'|'Restaurante'|'Actividad'|'Seguro'|'Entrada'|'Otro'} ReservationType */
/** @typedef {'Pendiente'|'Confirmada'|'Cancelada'|'Completada'} ReservationStatus */
/**
 * @typedef {Object} TripReservation
 * @property {string} title
 * @property {ReservationType} type
 * @property {ReservationStatus} status
 * @property {string} startAt ISO local date-time
 * @property {string|null} endAt
 * @property {number|null} costMinor Integer in the original currency minor unit
 * @property {'CRC'|'JPY'|'USD'} currency
 * @property {string|null} activityId Stable itinerary activity identifier
 * @property {string|null} expenseId Enforces one linked expense
 * @property {number} documentCount
 * @property {string} createdBy
 */
/**
 * @typedef {Object} TripDocumentMetadata
 * @property {string} visibleName
 * @property {string} category
 * @property {string} storagePath Private Storage path; never persist a download URL
 * @property {'application/pdf'|'image/jpeg'|'image/png'|'image/webp'} mimeType
 * @property {number} size
 * @property {boolean} sensitive
 * @property {string} uploadedBy
 * @property {string|null} reservationId
 * @property {string|null} activityId
 */
export {};
