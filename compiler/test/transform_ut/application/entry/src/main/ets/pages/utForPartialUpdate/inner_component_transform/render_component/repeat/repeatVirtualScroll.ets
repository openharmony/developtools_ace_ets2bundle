class ClassA {
	message: string
	constructor(message: string) {
		this.message = message
	}
}

@Entry
@Component
struct ChildComponent {
	@State arr: ClassA[] = [new ClassA('0'), new ClassA('1'), new ClassA('2')]
	count: number = 0;
	build() {
		List() {
			Repeat<ClassA>(this.arr)
				.each((obj: RepeatItem<ClassA>) => {
					ListItem() {
						Text(obj.item.message)
					}
				})
				.key((item: ClassA)=>{
					return JSON.stringify(item)
				})
				.virtualScroll({totalCount: this.arr.length})
				.templateId((item: ClassA, index: number)=>{
					return index.toString()
				})
				.template('1', (obj: RepeatItem<ClassA>) => {
					ListItem() {
						Text(obj.item.message)
					}
				})
		}
		.height(500)
	}
}