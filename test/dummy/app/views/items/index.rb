module Items
  class Index < Poirot::View
    def show_path
      item_path( self[ :id ] )
    end

    def edit_path
      edit_item_path( self[ :id ] )
    end

    def destroy_path
      show_path
    end

    def new_path
      new_item_path
    end
  end
end
