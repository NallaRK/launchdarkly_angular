import { Injectable, OnDestroy } from '@angular/core';
import { initialize, LDClient, LDFlagSet } from 'launchdarkly-js-client-sdk';
import { BehaviorSubject} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService implements OnDestroy {
  private flags: LDFlagSet | any;;
  private ldClient: LDClient | any;
  private ldInit: Function = initialize;
  private bgColor$: BehaviorSubject<boolean> | any;

  private readonly anonymousUserKey: string = 'OB*#RHREhfi2uewy79ds'; // Random

  private readonly clientSideID = '65b1c4788973a0104afa1b6e';


  public get getbgColor$(): BehaviorSubject<boolean> {
    return this.bgColor$;
  }

  public constructor() {
    this.initSubjects();
  }

  public ngOnDestroy(): void {
    this.bgColor$.complete();
  }
  /**
   * Sets the user information for the logged-in user for Launch Darkly Client.
   *
   * @param {any} loggedInUser - the logged-in user object
   * @return {Promise<void>} a Promise that resolves once the user is set
   */
  public async setUser(loggedInUser: any): Promise<void> {
    if (this.ldClient === undefined) {
      this.initLaunchDarkly();
    }

    this.ldClient.identify({
      anonymous: false,
      email: loggedInUser.email,
      firstName: loggedInUser.firstName,
      key: loggedInUser.email,
      kind: 'user',
      lastName: loggedInUser.lastName,
      name: `${loggedInUser.firstName} ${loggedInUser.lastName}`
    });
  }

  public initLaunchDarkly(): void {
    this.flags = {
      'bgColor': false,
      'fontColor': false
    }; // Default values of features

    this.ldClient = this.ldInit(
      this.clientSideID, // string from Launch Darkly
      {
        anonymous: true,
        key: this.anonymousUserKey,
        kind: 'user'
      }
    );

    this.ldClient.on('ready', this.handleReady.bind(this));

    //specific feature flag change
    this.ldClient.on(
      'change:bgColor',
      this.handlebgColorFeatureFlagChange.bind(this)
    );
    
    this.ldClient.on(  //not working
      'change:bgColor',
      (value: any, previous: any) => {
        console.log('bgColor changed:', value, '(' + previous + ')');
      });

    //All feature flags change
    this.ldClient.on('change', (settings: any) => { //not working
      console.log('flags changed:', settings);
    });
  }

  private initSubjects(): void {
    this.bgColor$ = new BehaviorSubject<boolean>(false);
  }

  private handleReady(): void {
    // Current feature flag settings from Launch Darkly
    this.flags = this.ldClient.allFlags();
    const flagValue = this.ldClient.variation("bgColor", false);
    console.log(this.flags);
    this.bgColor$.next(this.flags['bgColor']);
  }

  private handlebgColorFeatureFlagChange(value: boolean): void {
    this.flags['bgColor'] = value;
    console.log(this.flags);
    this.bgColor$.next(value);
  }


}