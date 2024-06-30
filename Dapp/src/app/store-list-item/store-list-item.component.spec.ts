import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreListItemComponent } from './store-list-item.component';

describe('StoreListItemComponent', () => {
  let component: StoreListItemComponent;
  let fixture: ComponentFixture<StoreListItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StoreListItemComponent]
    });
    fixture = TestBed.createComponent(StoreListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
