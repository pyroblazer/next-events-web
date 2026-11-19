import CarouselSection from '@/components/shared/CarouselSection';
import CategoryFilter from '@/components/shared/CategoryFilter';
import Collection from '@/components/shared/Collection'
import Search from '@/components/shared/Search';
import { getAllEvents } from '@/lib/actions/event.actions';
import { SearchParamProps } from '@/types';

export default async function Home(props: SearchParamProps) {
  const searchParams = await props.searchParams
  const page = Number(searchParams?.page) || 1;
  const searchText = (searchParams?.query as string) || '';
  const category = (searchParams?.category as string) || '';
  const location = (searchParams?.location as string) || '';
  const from = (searchParams?.from as string) || '';
  const to = (searchParams?.to as string) || '';
  const includePast = searchParams?.past === '1';

  const events = await getAllEvents({
    query: searchText,
    category,
    location,
    from,
    to,
    includePast,
    page,
    limit: 6
  })

  return (
    <>
      <CarouselSection />

      <div className="px-8">
        <section id="events" className="wrapper my-8 flex flex-col gap-8 md:gap-12">
          <h2 className="h2-bold">Browse Events</h2>

          <div className="flex w-full flex-col gap-5 md:flex-row">
            <Search />
            <CategoryFilter />
          </div>

          <form method="get" className="flex flex-wrap items-end gap-3" aria-label="Filter events">
            {searchText && <input type="hidden" name="query" value={searchText} />}
            {category && <input type="hidden" name="category" value={category} />}
            <label className="flex flex-col text-sm">Location<input name="location" defaultValue={location} className="h-11 rounded-full bg-grey-50 px-4" /></label>
            <label className="flex flex-col text-sm">From<input type="date" name="from" defaultValue={from} className="h-11 rounded-full bg-grey-50 px-4" /></label>
            <label className="flex flex-col text-sm">To<input type="date" name="to" defaultValue={to} className="h-11 rounded-full bg-grey-50 px-4" /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="past" value="1" defaultChecked={includePast} />Include past events</label>
            <button type="submit" className="button rounded-full px-6 py-2">Apply</button>
          </form>

          <Collection
            data={events?.data}
            emptyTitle="No Events Found"
            emptyStateSubtext="Come back later"
            collectionType="All_Events"
            limit={6}
            page={page}
            totalPages={events?.totalPages}
          />
        </section>
      </div>
    </>
  )
}
