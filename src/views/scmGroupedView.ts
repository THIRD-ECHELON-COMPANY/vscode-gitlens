import { Disposable } from 'vscode';
import type { Commands } from '../constants.commands';
import type { GroupableTreeViewTypes } from '../constants.views';
import type { Container } from '../container';
import { executeCommand, registerCommand } from '../system/vscode/command';
import { setContext } from '../system/vscode/context';
import { BranchesView } from './branchesView';
import { CommitsView } from './commitsView';
import { ContributorsView } from './contributorsView';
import { RemotesView } from './remotesView';
import { RepositoriesView } from './repositoriesView';
import { SearchAndCompareView } from './searchAndCompareView';
import { StashesView } from './stashesView';
import { TagsView } from './tagsView';
import type { TreeViewByType } from './viewBase';
import type { Views } from './views';
import { WorktreesView } from './worktreesView';

export class ScmGroupedView implements Disposable {
	private _disposable: Disposable;
	private _view: TreeViewByType[GroupableTreeViewTypes] | undefined;

	constructor(
		private readonly container: Container,
		private views: Views,
		private readonly included: GroupableTreeViewTypes[],
	) {
		this._disposable = Disposable.from(
			registerCommand('gitlens.views.scm.grouped.refresh', () => {
				if (this._view == null) return;

				executeCommand(`gitlens.views.${this._view.type}.refresh` as Commands);
			}),
			registerCommand('gitlens.views.scm.grouped.branches', () => this.setView('branches')),
			registerCommand('gitlens.views.scm.grouped.commits', () => this.setView('commits')),
			registerCommand('gitlens.views.scm.grouped.contributors', () => this.setView('contributors')),
			registerCommand('gitlens.views.scm.grouped.remotes', () => this.setView('remotes')),
			registerCommand('gitlens.views.scm.grouped.repositories', () => this.setView('repositories')),
			registerCommand('gitlens.views.scm.grouped.searchAndCompare', () => this.setView('searchAndCompare')),
			registerCommand('gitlens.views.scm.grouped.stashes', () => this.setView('stashes')),
			registerCommand('gitlens.views.scm.grouped.tags', () => this.setView('tags')),
			registerCommand('gitlens.views.scm.grouped.worktrees', () => this.setView('worktrees')),
		);

		this._view = this.setView(this.views.lastSelectedScmGroupedView!);
	}

	dispose() {
		this._disposable.dispose();
		this._view?.dispose();
	}

	setView<T extends GroupableTreeViewTypes>(type: T): TreeViewByType[T] {
		if (!this.included.includes(type)) {
			type = this.included[0] as T;
		}
		this.views.lastSelectedScmGroupedView = type;

		if (this._view?.type === type) return this._view as TreeViewByType[T];

		void setContext('gitlens:views:scm:grouped:view', type);
		this._view?.dispose();

		this._view = this.getView(type);
		return this._view as TreeViewByType[T];
	}

	private getView(type: GroupableTreeViewTypes) {
		switch (type) {
			case 'branches':
				return new BranchesView(this.container, true);
			case 'commits':
				return new CommitsView(this.container, true);
			case 'contributors':
				return new ContributorsView(this.container, true);
			case 'remotes':
				return new RemotesView(this.container, true);
			case 'repositories':
				return new RepositoriesView(this.container, true);
			case 'searchAndCompare':
				return new SearchAndCompareView(this.container, true);
			case 'stashes':
				return new StashesView(this.container, true);
			case 'tags':
				return new TagsView(this.container, true);
			case 'worktrees':
				return new WorktreesView(this.container, true);
		}
	}
}
