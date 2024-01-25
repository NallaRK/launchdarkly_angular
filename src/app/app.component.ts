import { Component, OnInit,  } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeatureFlagService } from './../featureFlagService.service_v2';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
@Component({
  selector: 'app-root',
  // standalone: true,
  // imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  bgColor$: Observable<any> | undefined;
  name$: Observable<any> | undefined;
  fontColor$: Observable<any> | undefined;

  public constructor(
    private featureFlagService: FeatureFlagService
  ){

  }

  public async ngOnInit(): Promise<void> {
    this.featureFlagService.initLaunchDarkly();
    this.showFlags();
  }

  private showFlags(): void {
    this.bgColor$ = this.featureFlagService.getFlag('bgColor', false);
    this.fontColor$ = this.featureFlagService.getFlag('fontColor', false);
    this.name$ = this.featureFlagService.getFlag('name', false);

    // this.fontColor$.subscribe((value: any) => {
    //   console.log('fontColor::', value);
    // })

  }
}
