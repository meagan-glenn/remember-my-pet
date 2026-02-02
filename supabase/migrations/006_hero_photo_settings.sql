-- Add hero photo crop setting to memorials
alter table public.memorials
  add column if not exists hero_photo_crop_y real default 50;
