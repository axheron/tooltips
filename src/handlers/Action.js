import React from 'react'

import MajorStats from 'sections/MajorStats'
import styles from './Action.module.css'
import Base from './Base'

const MELEE_RANGE = 3
const CAST_TIME_DIVISOR = 10

// Only get costTypes as IDs
const COST_TYPE = {
	MP: 3,
	TP: 5,
}

// Overkill? Overkill.
const COST_TYPE_NAME = {
	[COST_TYPE.MP]: 'MP',
	[COST_TYPE.TP]: 'TP',
}

export default class Action extends Base {
	static columns = {
		...Base.columns,
		icon: 'Icon',
		description: 'Description',

		actionCategory: 'ActionCategory.Name',
		range: 'Range',
		radius: 'EffectRange',

		castTime: 'Cast100ms',
		recastTime: 'Recast100ms',

		costType: 'CostType',
		cost: 'Cost',

		learntBy: 'ClassJob.Abbreviation',
		learntAt: 'ClassJobLevel',
		affinity: 'ClassJobCategory.Name',
	}

	// TODO: This needs to be abstracted into a shared lib at some point
	_calculateManaCost(costFactor) {
		// TODO: Only handling lv70 atm
		const levelModifier = 12000

		return Math.floor(costFactor * levelModifier/100)
	}

	render() {
		const {baseUrl, data} = this.props

		// Need to turn newlines into, like, _newlines_
		const description = data.description.replace(/\n/g, '<br/>')

		// Range === -1 seems to mean "melee distance", which is 3y
		let range = data.range
		if (range === -1) { range = MELEE_RANGE }

		// TODO: CostType handling
		//       Mana isn't 1:1
		// TODO: Anything that isn't on the tooltip for storm's path because that's the only example i've got right now

		// Cast times are stored in 100ms units
		const castTime = data.castTime ?
			(data.castTime / CAST_TIME_DIVISOR).toFixed(2) + 's' :
			'Instant'

		const recastTime = (data.recastTime / CAST_TIME_DIVISOR).toFixed(2) + 's'

		// We only want to show the cost major stat if there _is_ a cost
		const majorStats = [
			{name: 'Cast', value: castTime},
			{name: 'Recast', value: recastTime},
		]
		if (data.cost) {
			let cost = data.cost

			if (data.costType === COST_TYPE.MP) {
				cost = this._calculateManaCost(cost)
			}

			majorStats.push({
				name: COST_TYPE_NAME[data.costType] + ' Cost',
				value: cost,
			})
		}

		return <div className={styles.tooltip}>
			{/* Header */}
			<div className={styles.header}>
				<div className={styles.iconHolder}>
					<img src={baseUrl + data.icon}/>
				</div>

				<div className={styles.titleContainer}>
					<div className={styles.name}>{data.name}</div>
					<div className={styles.category}>{data.actionCategory}</div>
				</div>

				<dl className={styles.headerMeta}>
					<dt>Range</dt><dd>{range}y</dd>
					<dt>Radius</dt><dd>{data.radius}y</dd>
				</dl>
			</div>

			<MajorStats stats={majorStats}/>

			{/* Description */}
			<p
				className={styles.description}
				dangerouslySetInnerHTML={{__html: description}}
			/>

			{/* Meta */}
			<dl className={styles.meta}>
				<dt>Acquired</dt><dd>{data.learntBy} Lv. {data.learntAt}</dd>
				<dt>Affinity</dt><dd>{data.affinity}</dd>
			</dl>

			{/* :bloblove: */}
			<a href="https://xivapi.com/" className={styles.attribution}>xivapi.com</a>
		</div>
	}
}
