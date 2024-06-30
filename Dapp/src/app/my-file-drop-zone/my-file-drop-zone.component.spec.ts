import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyFileDropZoneComponent } from './my-file-drop-zone.component';

describe('MyFileDropZoneComponent', () => {
  let component: MyFileDropZoneComponent;
  let fixture: ComponentFixture<MyFileDropZoneComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyFileDropZoneComponent]
    });
    fixture = TestBed.createComponent(MyFileDropZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
