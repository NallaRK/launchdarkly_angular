//https://alex-migwi.medium.com/angular-feature-toggles-aka-feature-flags-using-launchdarkly-c0ba800c918e
import { Injectable, OnDestroy } from '@angular/core';
import { LDFlagSet, LDFlagValue } from 'launchdarkly-js-client-sdk';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs';
import * as LaunchDarkly from 'launchdarkly-js-client-sdk';


@Injectable({ providedIn: 'root' })
export class FeatureFlagService implements OnDestroy {
  private flags: LDFlagSet | any;
  private client: LaunchDarkly.LDClient | any;
  private _flagChange$: BehaviorSubject<Object> = new BehaviorSubject<Object>({});
  private readonly anonymousUserKey: string = 'OB*#RHREhfi2uewy79ds'; // Random

  flagChange$: Observable<Object> = this._flagChange$.asObservable();
  private readonly clientSideID = '65b1c4788973a0104afa1b6e';

  async ngOnDestroy() {
    await this.client.close();
}

initLaunchDarkly(): void {
    const context = {
        anonymous: true
    } as LaunchDarkly.LDSingleKindContext;

    this.client = LaunchDarkly.initialize(this.clientSideID, context);
    // this.client.on('ready', ()=>{
    //   this.flags = this.client.allFlags();
    //   console.log("🚀 ~ FeatureFlagService ~ initLaunchDarkly ~ flags:", this.flags);
    // });
}

// This method should be called after a user of your Angular application logs in. This is then used to send to Launch Darkly whatever identifying information about your users you wish. You can then use this information in the Launch Darkly portal to make feature flags conditional on user information (such as email, role, tenant, etc.).
public async setContext(sessionContext: any): Promise<void> {
  if (this.client === undefined) {
    this.initLaunchDarkly();
  }

  this.client.identify({
    anonymous: false,
    email: sessionContext.email,
    firstName: sessionContext.firstName,
    key: sessionContext.email,
    kind: 'user',
    lastName: sessionContext.lastName,
    name: `${sessionContext.firstName} ${sessionContext.lastName}`
  });
}


getFlag(flagKey: string, defaultValue: LDFlagValue = false): Observable<LDFlagValue> {
    const fetchFlag = new Subject<void>();
    this.client.on(`change:${flagKey}`, () => {
        fetchFlag.next();
    });
    this.client.waitUntilReady().then(() => {
        fetchFlag.next();
    });
    return fetchFlag.pipe(
        map(() => {
          console.log("🚀 ~ FeatureFlagService ~ map ~ flagKey:", flagKey);
            return this.client.variation(flagKey, defaultValue);
        })
    );
}


}