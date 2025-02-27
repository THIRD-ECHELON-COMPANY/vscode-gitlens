/*global*/
import './home.scss';
import { provide } from '@lit/context';
import { html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import type { State } from '../../home/protocol';
import { DidFocusAccount } from '../../home/protocol';
import { OverviewState, overviewStateContext } from '../plus/home/components/overviewState';
import type { GLHomeAccountContent } from '../plus/shared/components/home-account-content';
import { GlApp } from '../shared/app';
import { scrollableBase } from '../shared/components/styles/lit/base.css';
import type { Disposable } from '../shared/events';
import type { HostIpc } from '../shared/ipc';
import { homeBaseStyles, homeStyles } from './home.css';
import { HomeStateProvider } from './stateProvider';
import '../plus/shared/components/home-account-content';
import '../plus/home/components/active-work';
import '../plus/home/components/launchpad';
import '../plus/home/components/overview';
import './components/feature-nav';
import './components/home-nav';
import './components/integration-banner';
import './components/onboarding';
import './components/repo-alerts';

@customElement('gl-home-app')
export class GlHomeApp extends GlApp<State> {
	static override styles = [homeBaseStyles, scrollableBase, homeStyles];
	private disposable: Disposable | undefined;

	@provide({ context: overviewStateContext })
	private _overviewState!: OverviewState;

	@query('#account-content')
	private accountContentEl!: GLHomeAccountContent;

	private badgeSource = { source: 'home', detail: 'badge' };

	protected override createStateProvider(state: State, ipc: HostIpc) {
		this._overviewState = new OverviewState(ipc);

		return new HomeStateProvider(this, state, ipc);
	}

	override connectedCallback(): void {
		super.connectedCallback();

		this.disposable = this._ipc.onReceiveMessage(msg => {
			switch (true) {
				case DidFocusAccount.is(msg):
					this.accountContentEl.show();
					break;
			}
		});
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();

		this.disposable?.dispose();
	}

	override render() {
		return html`
			<div class="home scrollable">
				<gl-home-nav class="home__nav"></gl-home-nav>
				<gl-repo-alerts class="home__header"></gl-repo-alerts>
				<main class="home__main scrollable" id="main">
					<gl-onboarding></gl-onboarding>
					${when(
						this.state?.previewEnabled === true,
						() => html`
							<gl-integration-banner></gl-integration-banner>
							<gl-active-work></gl-active-work>
							<gl-launchpad></gl-launchpad>
							<gl-overview></gl-overview>
						`,
						() => html`<gl-feature-nav .badgeSource=${this.badgeSource}></gl-feature-nav>`,
					)}
				</main>

				<footer class="home__footer">
					<gl-home-account-content id="account-content"> </gl-home-account-content>
				</footer>
			</div>
		`;
	}
}
