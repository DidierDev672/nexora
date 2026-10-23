export type ReservaViewMode = 'cards' | 'table';

export interface ReservaApiDto {
  id: string;
  room_id: string;
  person_id: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  state: string;
  total_price: number;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export type ReservaTone =
  | 'amber'
  | 'emerald'
  | 'blue'
  | 'stone'
  | 'red'
  | 'purple';

export interface ReservaViewItem {
  id: string;
  roomId: string;
  roomDisplayName: string;
  roomFloor?: string | number;
  personId: string;
  personDisplayName: string;
  checkInDate: string;
  checkInFormatted: string;
  checkOutDate: string;
  checkOutFormatted: string;
  nights: number;
  numberOfGuests: number;
  state: string;
  stateLabel: string;
  stateTone: ReservaTone;
  totalPrice: number;
  totalPriceFormatted: string;
  createdBy: string;
  createdAt?: string;
}
